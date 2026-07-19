import prisma from "@portl/db";
import { destroyAsset } from "../../../lib/cloudinary";

// Re-export sendPushNotification from its new home for backward compatibility
export { sendPushNotification } from "./notification.service";


export class CommonSocietyService {
  // Get notices list
  static async getNotices(societyId: string): Promise<any[]> {
    // Auto delete expired notices
    try {
      const expiredNotices = await prisma.notice.findMany({
        where: {
          organizationId: societyId,
          endDate: {
            lt: new Date(),
          },
        },
        select: { id: true, bannerPublicId: true },
      });

      for (const not of expiredNotices) {
        if (not.bannerPublicId) {
          try {
            await destroyAsset(not.bannerPublicId, false);
          } catch (err) {
            console.error("Failed to delete expired notice banner:", err);
          }
        }
      }

      if (expiredNotices.length > 0) {
        await prisma.notice.deleteMany({
          where: { id: { in: expiredNotices.map((n) => n.id) } },
        });
      }
    } catch (err) {
      console.error("Failed to clean up expired notices:", err);
    }

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

  // Get community polls — vote counts computed in DB, not in-memory
  static async getPolls(societyId: string, userId: string): Promise<any[]> {
    const polls = await prisma.poll.findMany({
      where: { organizationId: societyId },
      orderBy: { createdAt: "desc" },
      // Do NOT include votes array — we aggregate in DB below
    });

    // Single aggregation query for all polls in this society
    const voteGroups = await prisma.pollVote.groupBy({
      by: ["pollId", "optionIndex"],
      where: { pollId: { in: polls.map((p) => p.id) } },
      _count: { optionIndex: true },
    });

    // Fetch only the current user's votes for this set of polls
    const userVotes = await prisma.pollVote.findMany({
      where: { userId, pollId: { in: polls.map((p) => p.id) } },
      select: { pollId: true, optionIndex: true },
    });
    const userVoteMap = new Map(userVotes.map((v) => [v.pollId, v.optionIndex]));

    return polls.map((p) => {
      const optionCounts = new Array(p.options.length).fill(0);
      let totalVotes = 0;
      for (const g of voteGroups) {
        if (g.pollId === p.id && g.optionIndex < optionCounts.length) {
          optionCounts[g.optionIndex] = g._count.optionIndex;
          totalVotes += g._count.optionIndex;
        }
      }
      return {
        id: p.id,
        question: p.question,
        options: p.options,
        totalVotes,
        userVotedIndex: userVoteMap.has(p.id) ? userVoteMap.get(p.id) : null,
        results: optionCounts,
        status: p.status,
        createdAt: p.createdAt,
      };
    });
  }

  // Get complaints (helpdesk) list
  static async getComplaints(societyId: string, userId?: string, isAdmin = false): Promise<any[]> {
    // Auto delete resolved complaints older than 2 days
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const expiredComplaints = await prisma.complaint.findMany({
        where: {
          organizationId: societyId,
          status: "RESOLVED",
          resolvedAt: {
            lt: twoDaysAgo,
          },
        },
        select: { id: true, imagePublicIds: true },
      });

      for (const comp of expiredComplaints) {
        if (comp.imagePublicIds && comp.imagePublicIds.length > 0) {
          for (const pubId of comp.imagePublicIds) {
            try {
              await destroyAsset(pubId, false);
            } catch (err) {
              console.error("Failed to delete expired complaint image:", err);
            }
          }
        }
      }

      if (expiredComplaints.length > 0) {
        await prisma.complaint.deleteMany({
          where: { id: { in: expiredComplaints.map((c) => c.id) } },
        });
      }
    } catch (err) {
      console.error("Failed to clean up expired complaints:", err);
    }

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
      orderBy: { name: "asc" },
    });
  }

  // Get list of society staff providers
  static async getStaff(societyId: string): Promise<any[]> {
    return await prisma.staffProvider.findMany({
      where: { organizationId: societyId },
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

  // Get towers list — flats included with only id/number for the setup screen.
  static async getTowers(societyId: string): Promise<any[]> {
    return await prisma.tower.findMany({
      where: { organizationId: societyId },
      include: {
        flats: {
          select: {
            id: true,
            number: true,
            _count: { select: { residents: true } },
          },
          orderBy: { number: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  // Lazy-load flats with residents for a single tower (used in assignment view)
  static async getTowerFlats(towerId: string, societyId: string): Promise<any[]> {
    return await prisma.flat.findMany({
      where: {
        towerId,
        tower: { organizationId: societyId },
      },
      include: {
        residents: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { number: "asc" },
    });
  }

  // Get results of a specific poll
  static async getPollResults(societyId: string, pollId: string): Promise<any> {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId, organizationId: societyId },
    });
    if (!poll) throw new Error("Poll not found");

    const voteGroups = await prisma.pollVote.groupBy({
      by: ["optionIndex"],
      where: { pollId },
      _count: { optionIndex: true },
    });

    const optionCounts = new Array(poll.options.length).fill(0);
    let totalVotes = 0;
    for (const g of voteGroups) {
      if (g.optionIndex < optionCounts.length) {
        optionCounts[g.optionIndex] = g._count.optionIndex;
        totalVotes += g._count.optionIndex;
      }
    }

    return {
      pollId,
      question: poll.question,
      options: poll.options,
      results: optionCounts,
      totalVotes,
      status: poll.status,
    };
  }
}
