import prisma from "@portl/db";
import { QueueService } from "./queue.service";
import { encryptText } from "../../lib/crypto";
import { generateSignedDownloadUrl, destroyAsset, extractPublicId } from "../../lib/cloudinary";


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

  // 3. Get all members of a society — includes full profiles
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
            aadharNumber: true,
            vehicleNumber: true,
            vehicles: true,
            flats: {
              where: { tower: { organizationId: societyId } },
              select: {
                id: true,
                number: true,
                occupancyStatus: true,
                memberCount: true,
                vehicleMemberCount: true,
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
  static async createNotice(
    societyId: string,
    authorId: string,
    data: { title: string; content: string; banner?: string | null; bannerPublicId?: string | null }
  ): Promise<any> {
    const notice = await prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        authorId,
        organizationId: societyId,
        banner: data.banner || null,
        bannerPublicId: data.bannerPublicId || null,
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

  // 5b. Close a community poll
  static async closePoll(societyId: string, pollId: string): Promise<any> {
    return await prisma.poll.update({
      where: { id: pollId, organizationId: societyId },
      data: { status: "CLOSED" },
    });
  }

  // 6. Update support complaint ticket status and notify creator
  static async updateComplaint(complaintId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED"): Promise<any> {
    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
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

  // Delete notice announcement and its banner from Cloudinary
  static async deleteNotice(societyId: string, noticeId: string): Promise<any> {
    const notice = await prisma.notice.findFirst({
      where: { id: noticeId, organizationId: societyId },
    });
    if (!notice) throw new Error("Notice announcement not found");

    if (notice.bannerPublicId) {
      try {
        await destroyAsset(notice.bannerPublicId, false);
      } catch (err) {
        console.error("Failed to delete notice banner:", err);
      }
    }

    return await prisma.notice.delete({
      where: { id: noticeId },
    });
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
    data: { name: string; phone: string; role: string; code?: string; aadharNumber?: string; aadharPublicId?: string; vehicleNumber?: string; avatar?: string }
  ): Promise<any> {
    return await prisma.staffProvider.create({
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        code: data.code,
        aadharNumber: data.aadharNumber,
        aadharPublicId: data.aadharPublicId,
        vehicleNumber: data.vehicleNumber,
        avatar: data.avatar,
        organizationId: societyId,
      },
    });
  }

  // 9. Remove a staff provider
  static async deleteStaff(staffId: string): Promise<any> {
    const staff = await prisma.staffProvider.findUnique({
      where: { id: staffId },
      select: { avatar: true, aadharPublicId: true },
    });

    if (staff) {
      if (staff.avatar) {
        const publicId = extractPublicId(staff.avatar);
        if (publicId) {
          await destroyAsset(publicId, false);
        }
      }
      if (staff.aadharPublicId) {
        await destroyAsset(staff.aadharPublicId, true);
      }
    }

    return await prisma.staffProvider.delete({
      where: { id: staffId },
    });
  }

  // 9b. Update a staff provider
  static async updateStaff(
    staffId: string,
    data: { name?: string; phone?: string; role?: string; code?: string | null; aadharNumber?: string | null; aadharPublicId?: string | null; vehicleNumber?: string | null; avatar?: string | null }
  ): Promise<any> {
    const currentStaff = await prisma.staffProvider.findUnique({
      where: { id: staffId },
      select: { avatar: true, aadharPublicId: true },
    });

    if (currentStaff) {
      // If avatar has changed, delete old one
      if (data.avatar !== undefined && data.avatar !== currentStaff.avatar && currentStaff.avatar) {
        const oldPublicId = extractPublicId(currentStaff.avatar);
        if (oldPublicId) {
          await destroyAsset(oldPublicId, false);
        }
      }
      // If Aadhar file has changed, delete old one
      if (data.aadharPublicId !== undefined && data.aadharPublicId !== currentStaff.aadharPublicId && currentStaff.aadharPublicId) {
        await destroyAsset(currentStaff.aadharPublicId, true);
      }
    }

    return await prisma.staffProvider.update({
      where: { id: staffId },
      data,
    });
  }

  // 9c. Get temporary signed download URL for staff Aadhar card
  static async getStaffAadharUrl(societyId: string, staffId: string): Promise<string | null> {
    const staff = await prisma.staffProvider.findFirst({
      where: { id: staffId, organizationId: societyId },
      select: { aadharPublicId: true },
    });
    if (!staff?.aadharPublicId) return null;
    return generateSignedDownloadUrl(staff.aadharPublicId);
  }

  // 9d. Delete staff profile photo (avatar)
  static async deleteStaffAvatar(societyId: string, staffId: string): Promise<boolean> {
    const staff = await prisma.staffProvider.findFirst({
      where: { id: staffId, organizationId: societyId },
      select: { avatar: true },
    });
    if (staff?.avatar) {
      const publicId = extractPublicId(staff.avatar);
      if (publicId) {
        await destroyAsset(publicId, false);
      }
    }
    await prisma.staffProvider.update({
      where: { id: staffId },
      data: { avatar: null },
    });
    return true;
  }

  // 9e. Delete staff Aadhar document
  static async deleteStaffAadhar(societyId: string, staffId: string): Promise<boolean> {
    const staff = await prisma.staffProvider.findFirst({
      where: { id: staffId, organizationId: societyId },
      select: { aadharPublicId: true },
    });
    if (staff?.aadharPublicId) {
      await destroyAsset(staff.aadharPublicId, true);
    }
    await prisma.staffProvider.update({
      where: { id: staffId },
      data: { aadharNumber: null, aadharPublicId: null },
    });
    return true;
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

  // 13. Create Resident Manually
  static async createResident(
    societyId: string,
    data: { name: string; email: string; phone?: string; aadharNumber?: string; image?: string }
  ): Promise<any> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    let user = existing;
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          aadharNumber: data.aadharNumber,
          image: data.image,
        },
      });
    }

    const existingMember = await prisma.member.findFirst({
      where: { userId: user.id, organizationId: societyId },
    });

    if (!existingMember) {
      await prisma.member.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          organizationId: societyId,
          role: "resident",
        },
      });
    }

    return user;
  }

  // 14. Update Resident Profile
  static async updateResident(
    userId: string,
    data: { name?: string; email?: string; aadharNumber?: string | null; image?: string | null }
  ): Promise<any> {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // 15. Delete Resident / Remove from society
  static async deleteResident(societyId: string, userId: string): Promise<any> {
    // Remove member link
    await prisma.member.deleteMany({
      where: { userId, organizationId: societyId },
    });

    // Disconnect flat assignments in this society
    const flats = await prisma.flat.findMany({
      where: {
        tower: { organizationId: societyId },
        residents: { some: { id: userId } },
      },
      select: { id: true },
    });

    if (flats.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          flats: {
            disconnect: flats.map((f) => ({ id: f.id })),
          },
        },
      });
    }

    return { deleted: true };
  }

  // 16. Flexible Flat Allocation
  static async allocateFlat(
    societyId: string,
    data: {
      flatId: string;
      ownerId?: string | null;
      occupancyStatus: string;
      memberCount?: number;
      vehicleMemberCount?: number;
      residentIds?: string[];
    }
  ): Promise<any> {
    const flat = await prisma.flat.findUnique({
      where: { id: data.flatId },
      include: { tower: true },
    });

    if (!flat || flat.tower.organizationId !== societyId) {
      throw new Error("Flat not found in this society");
    }

    return await prisma.flat.update({
      where: { id: data.flatId },
      data: {
        ownerId: data.ownerId || null,
        occupancyStatus: data.occupancyStatus,
        memberCount: data.memberCount ?? 0,
        vehicleMemberCount: data.vehicleMemberCount ?? 0,
        residents: {
          set: data.residentIds ? data.residentIds.map((id) => ({ id })) : [],
        },
      },
      include: {
        residents: true,
        owner: true,
      },
    });
  }

  // 17. Update Razorpay Payment Config for Society
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

  // 17b. Retrieve payment config keys
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

  // 18. Retrieve all Amenity/Event Booking requests
  static async getBookingRequests(societyId: string): Promise<any[]> {
    return await prisma.amenityBooking.findMany({
      where: {
        amenity: { organizationId: societyId },
      },
      include: {
        amenity: true,
        bookedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  // 19. Respond to booking request
  static async respondToBookingRequest(
    bookingId: string,
    status: "APPROVED" | "REJECTED" | "CANCELLED"
  ): Promise<any> {
    const booking = await prisma.amenityBooking.update({
      where: { id: bookingId },
      data: { status },
      include: { amenity: true },
    });

    // Notify applicant
    const title = `Event Booking status: ${status} 📅`;
    const body = `Your request to book "${booking.amenity.name}" on ${new Date(booking.date).toLocaleDateString()} is ${status.toLowerCase()}`;

    await prisma.notification.create({
      data: {
        userId: booking.bookedById,
        title,
        body,
        type: "AMENITY",
        data: JSON.stringify({ bookingId }),
      },
    });

    await QueueService.pushNotificationJob(booking.bookedById, title, body, "AMENITY");

    return booking;
  }
}
