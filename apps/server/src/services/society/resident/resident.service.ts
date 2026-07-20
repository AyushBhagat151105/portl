import prisma from "@portl/db";
import type { Visitor } from "@portl/db";
import { destroyAsset, extractPublicId } from "../../../lib/cloudinary";


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

  // 1b. Get current resident's profile details
  static async getMyProfile(userId: string): Promise<any> {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vehicles: true,
        flats: {
          include: {
            tower: true,
          },
        },
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

  // 5. Reserve an amenity booking timeslot (prevents duplicate approved slots)
  static async bookAmenity(userId: string, data: { amenityId: string; date: Date; timeslot: string; purpose?: string }): Promise<any> {
    const existing = await prisma.amenityBooking.findFirst({
      where: {
        amenityId: data.amenityId,
        date: data.date,
        timeslot: data.timeslot,
        status: "APPROVED",
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
        purpose: data.purpose,
        status: "PENDING",
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

  // 10. Update Resident Profile
  static async updateMyProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string | null;
      aadharNumber?: string | null;
      image?: string | null;
      aadharPublicId?: string | null;
      vehicles?: { plateNumber: string; makeModel?: string | null; type: "CAR" | "BIKE" }[];
    }
  ): Promise<any> {
    return await prisma.$transaction(async (tx) => {
      // Fetch current values to check for changes
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { image: true, aadharPublicId: true },
      });

      // If new avatar image is specified and it has changed, delete old one
      if (data.image !== undefined && data.image !== currentUser?.image && currentUser?.image) {
        const oldPublicId = extractPublicId(currentUser.image);
        if (oldPublicId) {
          await destroyAsset(oldPublicId, false);
        }
      }

      // If new aadharPublicId is specified and it has changed, delete old one
      if (data.aadharPublicId !== undefined && data.aadharPublicId !== currentUser?.aadharPublicId && currentUser?.aadharPublicId) {
        await destroyAsset(currentUser.aadharPublicId, true);
      }

      // Update User details
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          aadharNumber: data.aadharNumber,
          image: data.image,
          aadharPublicId: data.aadharPublicId,
          phoneNumber: data.phone,
          phoneNumberVerified: data.phone ? true : false,
        },
      });

      // Update vehicles if provided
      if (data.vehicles) {
        // Disconnect or delete old vehicles for this user
        await tx.vehicle.deleteMany({
          where: { ownerId: userId },
        });

        // Find user's active organization (society)
        const member = await tx.member.findFirst({
          where: { userId },
        });

        const activeOrgId = member?.organizationId;

        // Find user's first assigned flat
        const userWithFlats = await tx.user.findUnique({
          where: { id: userId },
          include: { flats: true },
        });
        const firstFlatId = userWithFlats?.flats[0]?.id;

        if (activeOrgId) {
          for (const v of data.vehicles) {
            await tx.vehicle.create({
              data: {
                plateNumber: v.plateNumber.toUpperCase(),
                makeModel: v.makeModel,
                type: v.type,
                ownerId: userId,
                flatId: firstFlatId || null,
                organizationId: activeOrgId,
              },
            });
          }
        }
      }

      return user;
    });
  }

  // 13. Create a support ticket complaint
  static async createComplaint(
    userId: string,
    data: {
      title: string;
      description: string;
      category: string;
      flatId?: string | null;
      images?: string[];
      imagePublicIds?: string[];
    }
  ): Promise<any> {
    const member = await prisma.member.findFirst({
      where: { userId },
    });
    if (!member) throw new Error("User is not a member of any society");

    return await prisma.complaint.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        flatId: data.flatId || null,
        organizationId: member.organizationId,
        raisedById: userId,
        status: "PENDING",
        images: data.images || [],
        imagePublicIds: data.imagePublicIds || [],
      },
    });
  }
}
