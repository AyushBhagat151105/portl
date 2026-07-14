import prisma from "@portl/db";
import type { Visitor } from "@portl/db";

export class ResidentSocietyService {
  // 1. Get resident's flats
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

  // 2. Retrieve pending gate call entries targetting resident flats
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

  // 3. Respond to pending gate calls (APPROVED / REJECTED)
  static async respondToVisitor(visitorId: string, status: "APPROVED" | "REJECTED"): Promise<Visitor> {
    return await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        status,
        enteredAt: status === "APPROVED" ? new Date() : null,
      },
    });
  }

  // 4. Pre-approve a guest (generates 6-digit passcode code)
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

  // 5. Reserve an amenity booking timeslot (prevents duplicate slots)
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

  // 6. Cast a vote on a community poll
  static async votePoll(pollId: string, userId: string, optionIndex: number): Promise<any> {
    return await prisma.pollVote.create({
      data: {
        pollId,
        userId,
        optionIndex,
      },
    });
  }
}
