import prisma from "@portl/db";
import { sendPushNotification } from "./common.service";

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

  // 3. Get all members of a society
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
              include: { tower: true },
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

    for (const member of members) {
      const title = "New Notice Alert 📢";
      const body = data.title;

      await prisma.notification.create({
        data: {
          userId: member.userId,
          title,
          body,
          type: "NOTICE",
          data: JSON.stringify({ noticeId: notice.id }),
        },
      });

      await sendPushNotification(member.userId, title, body, {
        url: `/resident/dashboard`,
      });
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

    for (const member of members) {
      const title = "New Community Poll 📊";
      const body = data.question;

      await prisma.notification.create({
        data: {
          userId: member.userId,
          title,
          body,
          type: "POLL",
          data: JSON.stringify({ pollId: poll.id }),
        },
      });

      await sendPushNotification(member.userId, title, body, {
        url: `/resident/dashboard`,
      });
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

    await sendPushNotification(complaint.raisedById, title, body, {
      url: `/resident/helpdesk`,
    });

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
}
