import prisma from "@portl/db";
import { QueueService } from "../common/queue.service";
import { encryptText } from "../../../lib/crypto";


export class AdminBillingService {
  // Generate maintenance dues for all flats and notify residents
  static async generateDues(
    societyId: string,
    amount: number,
    month: string,
    dueDate: Date
  ): Promise<any> {
    const flats = await prisma.flat.findMany({
      where: {
        tower: { organizationId: societyId },
      },
      include: {
        residents: true,
      },
    });

    if (flats.length === 0) {
      throw new Error("No flats registered in this society to generate dues for");
    }

    return await prisma.$transaction(async (tx) => {
      const createdDues = [];
      const notificationData = [];
      const residentIdsToNotify = new Set<string>();

      for (const flat of flats) {
        // Skip flats that are not linked to any active residents
        if (flat.residents.length === 0) {
          continue;
        }

        const due = await tx.maintenanceDue.create({
          data: {
            flatId: flat.id,
            amount,
            month,
            dueDate,
            organizationId: societyId,
            status: "PENDING",
          },
        });
        createdDues.push(due);

        // Add notifications for the residents of the flat
        for (const resident of flat.residents) {
          residentIdsToNotify.add(resident.id);
          notificationData.push({
            userId: resident.id,
            title: "Maintenance Bill Generated 💳",
            body: `Rent/Maintenance bill of INR ${amount} generated for ${month} is due on ${new Date(dueDate).toLocaleDateString()}`,
            type: "BILLING",
          });
        }
      }

      // Write in-app notifications
      if (notificationData.length > 0) {
        await tx.notification.createMany({
          data: notificationData,
        });
      }

      // Bulk push to notifications job queue
      const uniqueResidentIds = Array.from(residentIdsToNotify);
      if (uniqueResidentIds.length > 0) {
        await QueueService.pushNotificationJobsBulk(
          uniqueResidentIds,
          "Maintenance Bill Generated 💳",
          `Rent/Maintenance bill of INR ${amount} generated for ${month}.`,
          "BILLING"
        );
      }

      return { generatedCount: createdDues.length };
    });
  }

  // Fetch maintenance dues logs with cursor pagination and optional filters
  static async getDues(
    societyId: string,
    params: { cursor?: string; limit?: number; month?: string; status?: string }
  ): Promise<{ data: any[]; nextCursor: string | null }> {
    const take = Math.min(params.limit ?? 20, 50); // hard cap at 50

    const where: any = { organizationId: societyId };
    if (params.month) where.month = params.month;
    if (params.status) where.status = params.status;
    if (params.cursor) where.id = { lt: params.cursor }; // cursor is the last seen id

    const items = await prisma.maintenanceDue.findMany({
      where,
      take: take + 1, // fetch one extra to determine if there's a next page
      include: {
        flat: {
          include: {
            tower: true,
            residents: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hasMore = items.length > take;
    const data = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1]!.id : null;

    return { data, nextCursor };
  }

  // Mark pending bill paid offline (reconciliation)
  static async markDuePaidOffline(dueId: string): Promise<any> {
    const due = await prisma.maintenanceDue.findUnique({
      where: { id: dueId },
    });

    if (!due) throw new Error("Due record not found");
    if (due.status === "PAID") throw new Error("This due is already paid");

    return await prisma.maintenanceDue.update({
      where: { id: dueId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        razorpayPaymentId: "OFFLINE_PAYMENT",
      },
    });
  }

  // Update Razorpay Payment Config for Society
  static async updatePaymentConfig(
    societyId: string,
    data: { razorpayKeyId: string; razorpayKeySecret: string }
  ): Promise<any> {
    const encryptedSecret = encryptText(data.razorpayKeySecret);
    return await prisma.organization.update({
      where: { id: societyId },
      data: {
        razorpayKeyId: data.razorpayKeyId,
        razorpayKeySecret: encryptedSecret,
      },
    });
  }

  // Retrieve payment config keys
  static async getPaymentConfig(societyId: string): Promise<any> {
    const org = await prisma.organization.findUnique({
      where: { id: societyId },
      select: {
        razorpayKeyId: true,
        razorpayKeySecret: true,
      },
    });
    return {
      razorpayKeyId: org?.razorpayKeyId || "",
      hasSecret: !!org?.razorpayKeySecret,
    };
  }
}
