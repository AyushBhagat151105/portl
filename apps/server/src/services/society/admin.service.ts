import prisma from "@portl/db";
import { QueueService } from "./queue.service";


export class AdminSocietyService {
  // 1. Setup society flats and towers (Upsert-safe: updates structures if already existing)
  static async setupSociety(societyId: string, data: { towers: { name: string; flats: string[] }[] }): Promise<any[]> {
    return await prisma.$transaction(async (tx) => {
      const results = [];
      for (const t of data.towers) {
        // Find existing tower or create it
        let tower = await tx.tower.findFirst({
          where: { name: t.name, organizationId: societyId },
        });
        if (!tower) {
          tower = await tx.tower.create({
            data: {
              name: t.name,
              organizationId: societyId,
            },
          });
        }

        // Add flats under this tower (skip if already exists)
        for (const num of t.flats) {
          const existingFlat = await tx.flat.findFirst({
            where: { number: num, towerId: tower.id },
          });
          if (!existingFlat) {
            await tx.flat.create({
              data: {
                number: num,
                towerId: tower.id,
              },
            });
          }
        }
        results.push(tower);
      }
      return results;
    });
  }

  // 2. Assign a resident to a flat
  static async assignFlat(societyId: string, userId: string, flatId: string): Promise<any> {
    const flat = await prisma.flat.findUnique({
      where: { id: flatId },
      include: { tower: true },
    });
    if (!flat || flat.tower.organizationId !== societyId) {
      throw new Error("Flat not found in this society");
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        flats: {
          connect: { id: flatId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        flats: {
          where: { tower: { organizationId: societyId } },
          include: { tower: true },
        },
      },
    });
  }

  // 3. Get all members of a society — flats select is narrow to keep payload small
  static async getMembers(societyId: string): Promise<any[]> {
    return await prisma.member.findMany({
      where: { organizationId: societyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            flats: {
              where: { tower: { organizationId: societyId } },
              select: {
                id: true,
                number: true,
                tower: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // 4. Publish a notice and notify all residents
  static async createNotice(societyId: string, authorId: string, data: { title: string; content: string }): Promise<any> {
    const notice = await prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        authorId,
        organizationId: societyId,
      },
    });

    const members = await prisma.member.findMany({
      where: { organizationId: societyId, role: "resident" },
    });

    const title = "New Notice Alert 📢";
    const body = data.title;

    if (members.length > 0) {
      const notifications = members.map((member) => ({
        userId: member.userId,
        title,
        body,
        type: "NOTICE",
        data: JSON.stringify({ noticeId: notice.id }),
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      const userIds = members.map((m) => m.userId);
      await QueueService.pushNotificationJobsBulk(userIds, title, body, "NOTICE");
    }

    return notice;
  }

  // 5. Create a community voting poll and notify all residents
  static async createPoll(societyId: string, data: { question: string; options: string[] }): Promise<any> {
    const poll = await prisma.poll.create({
      data: {
        question: data.question,
        options: data.options,
        organizationId: societyId,
      },
    });

    const members = await prisma.member.findMany({
      where: { organizationId: societyId, role: "resident" },
    });

    const title = "New Community Poll 📊";
    const body = data.question;

    if (members.length > 0) {
      const notifications = members.map((member) => ({
        userId: member.userId,
        title,
        body,
        type: "POLL",
        data: JSON.stringify({ pollId: poll.id }),
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      const userIds = members.map((m) => m.userId);
      await QueueService.pushNotificationJobsBulk(userIds, title, body, "POLL");
    }

    return poll;
  }

  // 6. Update support complaint ticket status and notify creator
  static async updateComplaint(complaintId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED"): Promise<any> {
    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
    });

    const title = "Complaint Ticket Updated 🛠️";
    const body = `Your complaint "${complaint.title}" is now marked as ${status.replace("_", " ").toLowerCase()}`;

    await prisma.notification.create({
      data: {
        userId: complaint.raisedById,
        title,
        body,
        type: "COMPLAINT",
        data: JSON.stringify({ complaintId }),
      },
    });

    await QueueService.pushNotificationJob(complaint.raisedById, title, body, "COMPLAINT");

    return complaint;
  }

  // 7. Create a new amenity
  static async createAmenity(
    societyId: string,
    data: { name: string; description?: string; location?: string; capacity?: number }
  ): Promise<any> {
    return await prisma.amenity.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        capacity: data.capacity,
        organizationId: societyId,
      },
    });
  }

  // 8. Create a new staff directory provider
  static async createStaff(
    societyId: string,
    data: { name: string; phone: string; role: string; code?: string }
  ): Promise<any> {
    return await prisma.staffProvider.create({
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        code: data.code,
        organizationId: societyId,
      },
    });
  }

  // 9. Remove a staff provider
  static async deleteStaff(staffId: string): Promise<any> {
    return await prisma.staffProvider.delete({
      where: { id: staffId },
    });
  }

  // 10. Generate maintenance dues for all flats and notify residents
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

  // 11. Fetch maintenance dues logs with cursor pagination and optional filters
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

  // 12. Mark pending bill paid offline (reconciliation)
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
}
