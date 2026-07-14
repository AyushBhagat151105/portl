import prisma from "@portl/db";
import type { Visitor } from "@portl/db";

// Helper to push remote notifications using Expo's API
export async function sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
    });
    if (!tokens.length) return;

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      data: data || {},
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}

export class SocietyService {
  // 1. Setup society flats and towers
  static async setupSociety(societyId: string, data: { towers: { name: string; flats: string[] }[] }): Promise<any[]> {
    return await prisma.$transaction(async (tx) => {
      const results = [];
      for (const t of data.towers) {
        // Create tower
        const tower = await tx.tower.create({
          data: {
            name: t.name,
            organizationId: societyId,
          },
        });

        // Create flats under this tower
        const flatsData = t.flats.map((num) => ({
          number: num,
          towerId: tower.id,
        }));

        await tx.flat.createMany({
          data: flatsData,
        });

        results.push(tower);
      }
      return results;
    });
  }

  // 2. Search residents
  static async searchResidents(societyId: string, search: string): Promise<any[]> {
    return await prisma.user.findMany({
      where: {
        flats: {
          some: {
            tower: {
              organizationId: societyId,
            },
          },
        },
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        flats: {
          where: {
            tower: {
              organizationId: societyId,
            },
          },
          select: {
            id: true,
            number: true,
            tower: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // 3. Register visitor at gate (PENDING)
  static async registerVisitor(
    societyId: string,
    guardId: string,
    data: { name: string; phone: string; purpose?: string; type: "GUEST" | "DELIVERY" | "CAB" | "STAFF"; flatId: string }
  ): Promise<Visitor> {
    const visitor = await prisma.visitor.create({
      data: {
        name: data.name,
        phone: data.phone,
        purpose: data.purpose,
        type: data.type,
        status: "PENDING",
        flatId: data.flatId,
        registeredById: guardId,
        organizationId: societyId,
      },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });

    // Notify residents of the target Flat
    const flat = await prisma.flat.findUnique({
      where: { id: data.flatId },
      include: { residents: true, tower: true },
    });

    if (flat && flat.residents.length > 0) {
      for (const resident of flat.residents) {
        // Create in-app notification
        const notificationTitle = "Gate Access Request 🔔";
        const notificationBody = `${visitor.name} (${data.type.toLowerCase()}) is requesting entry to your flat ${flat.tower.name} - ${flat.number}`;

        await prisma.notification.create({
          data: {
            userId: resident.id,
            title: notificationTitle,
            body: notificationBody,
            type: "GATE_CALL",
            data: JSON.stringify({ visitorId: visitor.id }),
          },
        });

        // Trigger Expo push
        await sendPushNotification(resident.id, notificationTitle, notificationBody, {
          url: `/resident/dashboard?activeVisitorId=${visitor.id}`,
        });
      }
    }

    return visitor;
  }

  // 4. Verify passcode (Pre-approved guest)
  static async verifyPasscode(societyId: string, guardId: string, code: string): Promise<Visitor | null> {
    const visitor = await prisma.visitor.findFirst({
      where: {
        organizationId: societyId,
        preApprovedCode: code,
        status: "PENDING",
      },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });

    if (!visitor) {
      return null;
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id: visitor.id },
      data: {
        status: "APPROVED",
        enteredAt: new Date(),
        registeredById: guardId,
      },
    });

    // Notify flat residents
    const flat = await prisma.flat.findUnique({
      where: { id: visitor.flatId },
      include: { residents: true, tower: true },
    });

    if (flat && flat.residents.length > 0) {
      for (const resident of flat.residents) {
        const title = "Guest Entered Gate 🚪";
        const body = `Pre-approved guest ${visitor.name} has checked into Flat ${flat.tower.name} - ${flat.number}`;

        await prisma.notification.create({
          data: {
            userId: resident.id,
            title,
            body,
            type: "GATE_CALL",
            data: JSON.stringify({ visitorId: visitor.id }),
          },
        });

        await sendPushNotification(resident.id, title, body, {
          url: `/resident/notifications`,
        });
      }
    }

    return updatedVisitor;
  }

  // 5. Mark visitor exit
  static async markVisitorExit(visitorId: string): Promise<Visitor | null> {
    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });
    if (!visitor) return null;

    const updated = await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        status: "EXITED",
        exitedAt: new Date(),
      },
    });

    // Notify residents
    const flat = await prisma.flat.findUnique({
      where: { id: visitor.flatId },
      include: { residents: true },
    });

    if (flat && flat.residents.length > 0) {
      for (const resident of flat.residents) {
        const title = "Visitor Checked Out 👋";
        const body = `${visitor.name} has exited the society gate.`;

        await prisma.notification.create({
          data: {
            userId: resident.id,
            title,
            body,
            type: "GATE_CALL",
            data: JSON.stringify({ visitorId: visitor.id }),
          },
        });

        await sendPushNotification(resident.id, title, body, {
          url: `/resident/notifications`,
        });
      }
    }

    return updated;
  }

  // 6. Get active logs
  static async getActiveVisitors(societyId: string): Promise<Visitor[]> {
    return await prisma.visitor.findMany({
      where: {
        organizationId: societyId,
        status: { in: ["APPROVED", "PENDING"] },
      },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 7. Get pending approvals (Resident Gate Calls)
  static async getPendingGateCalls(userId: string): Promise<Visitor[]> {
    return await prisma.visitor.findMany({
      where: {
        status: "PENDING",
        flat: {
          residents: {
            some: { id: userId },
          },
        },
      },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 8. Approve or Reject gate entry
  static async respondToVisitor(visitorId: string, status: "APPROVED" | "REJECTED"): Promise<Visitor> {
    return await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        status,
        enteredAt: status === "APPROVED" ? new Date() : null,
      },
    });
  }

  // 9. Pre-approve guest
  static async preApproveGuest(
    userId: string,
    data: { name: string; phone: string; purpose?: string; flatId: string }
  ): Promise<Visitor> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const flat = await prisma.flat.findUnique({
      where: { id: data.flatId },
      include: { tower: true },
    });
    if (!flat) throw new Error("Target Flat not found");

    return await prisma.visitor.create({
      data: {
        name: data.name,
        phone: data.phone,
        purpose: data.purpose,
        type: "GUEST",
        status: "PENDING",
        preApprovedCode: code,
        flatId: data.flatId,
        registeredById: userId,
        organizationId: flat.tower.organizationId,
      },
    });
  }

  // 10. Notices management
  static async getNotices(societyId: string): Promise<any[]> {
    return await prisma.notice.findMany({
      where: { organizationId: societyId },
      include: {
        author: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

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

  // 11. Polls management
  static async getPolls(societyId: string, userId: string): Promise<any[]> {
    const polls = await prisma.poll.findMany({
      where: { organizationId: societyId },
      include: {
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return polls.map((p) => {
      const userVote = p.votes.find((v) => v.userId === userId);
      const optionCounts = new Array(p.options.length).fill(0);
      p.votes.forEach((v) => {
        if (v.optionIndex < optionCounts.length) {
          optionCounts[v.optionIndex]++;
        }
      });

      return {
        id: p.id,
        question: p.question,
        options: p.options,
        totalVotes: p.votes.length,
        userVotedIndex: userVote ? userVote.optionIndex : null,
        results: optionCounts,
        createdAt: p.createdAt,
      };
    });
  }

  static async votePoll(pollId: string, userId: string, optionIndex: number): Promise<any> {
    return await prisma.pollVote.create({
      data: {
        pollId,
        userId,
        optionIndex,
      },
    });
  }

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

  // 12. Complaints (Helpdesk)
  static async getComplaints(societyId: string, userId?: string, isAdmin = false): Promise<any[]> {
    if (isAdmin) {
      return await prisma.complaint.findMany({
        where: { organizationId: societyId },
        include: {
          raisedBy: { select: { name: true, email: true } },
          flat: { include: { tower: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return await prisma.complaint.findMany({
      where: { organizationId: societyId, raisedById: userId },
      include: {
        flat: { include: { tower: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async raiseComplaint(
    societyId: string,
    userId: string,
    data: { title: string; description: string; category: string; flatId?: string }
  ): Promise<any> {
    return await prisma.complaint.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        status: "PENDING",
        raisedById: userId,
        flatId: data.flatId || null,
        organizationId: societyId,
      },
    });
  }

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

  // 13. Amenities Management
  static async getAmenities(societyId: string): Promise<any[]> {
    return await prisma.amenity.findMany({
      where: { organizationId: societyId },
      include: {
        bookings: {
          where: { date: { gte: new Date() } },
          include: {
            bookedBy: { select: { name: true } },
          },
        },
      },
    });
  }

  static async bookAmenity(userId: string, data: { amenityId: string; date: Date; timeslot: string }): Promise<any> {
    const existing = await prisma.amenityBooking.findFirst({
      where: {
        amenityId: data.amenityId,
        date: data.date,
        timeslot: data.timeslot,
        status: "CONFIRMED",
      },
    });

    if (existing) {
      throw new Error("This timeslot is already booked");
    }

    return await prisma.amenityBooking.create({
      data: {
        amenityId: data.amenityId,
        bookedById: userId,
        date: data.date,
        timeslot: data.timeslot,
      },
      include: {
        amenity: true,
      },
    });
  }

  // 14. Staff Provider Directory
  static async getStaff(societyId: string): Promise<any[]> {
    return await prisma.staffProvider.findMany({
      where: { organizationId: societyId },
    });
  }

  // 15. Mobile Device Push Tokens
  static async registerPushToken(userId: string, token: string): Promise<any> {
    return await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { token, userId },
    });
  }

  // 16. User In-app Notification logs
  static async getNotifications(userId: string): Promise<any[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markNotificationRead(notificationId: string): Promise<any> {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  // 17. Get logged in user flats
  static async getMyFlats(userId: string): Promise<any[]> {
    return await prisma.flat.findMany({
      where: {
        residents: {
          some: { id: userId },
        },
      },
      include: {
        tower: true,
      },
    });
  }
}
