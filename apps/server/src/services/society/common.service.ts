import prisma from "@portl/db";

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

export class CommonSocietyService {
  // Get notices list
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

  // Get community polls
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

  // Get complaints (helpdesk) list
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

  // Get list of all amenities
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

  // Get list of society staff providers
  static async getStaff(societyId: string): Promise<any[]> {
    return await prisma.staffProvider.findMany({
      where: { organizationId: societyId },
    });
  }

  // Register push token for user device
  static async registerPushToken(userId: string, token: string): Promise<any> {
    return await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { token, userId },
    });
  }

  // Get notifications logs
  static async getNotifications(userId: string): Promise<any[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Mark in-app notification read
  static async markNotificationRead(notificationId: string): Promise<any> {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  // Get first active society membership
  static async getMembership(userId: string): Promise<any | null> {
    const member = await prisma.member.findFirst({
      where: { userId },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return member;
  }

  // Join a society by slug
  static async joinSociety(userId: string, slug: string, role: string): Promise<any> {
    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new Error("Society not found with this code");

    const existing = await prisma.member.findFirst({
      where: { userId, organizationId: org.id },
    });
    if (existing) throw new Error("You are already a member of this society");

    return await prisma.member.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        organizationId: org.id,
        role,
      },
      include: {
        organization: true,
      },
    });
  }

  // Get towers and flats configuration list
  static async getTowers(societyId: string): Promise<any[]> {
    return await prisma.tower.findMany({
      where: { organizationId: societyId },
      include: {
        flats: {
          include: {
            residents: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
