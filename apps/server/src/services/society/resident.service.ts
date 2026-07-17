import prisma from "@portl/db";
import type { Visitor } from "@portl/db";
import { decryptText } from "../../lib/crypto";
import { destroyAsset, extractPublicId } from "../../lib/cloudinary";

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

  // 7. Get resident's maintenance dues
  static async getMyDues(userId: string): Promise<any[]> {
    return await prisma.maintenanceDue.findMany({
      where: {
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

  // 8. Create Razorpay order for due payment using Dynamic Credentials
  static async createRazorpayOrder(dueId: string, userId: string): Promise<any> {
    const due = await prisma.maintenanceDue.findUnique({
      where: { id: dueId },
      include: {
        flat: {
          include: {
            residents: true,
          },
        },
      },
    });

    if (!due) throw new Error("Due record not found");
    if (due.status === "PAID") throw new Error("This due is already paid");

    const isResident = due.flat.residents.some((r) => r.id === userId);
    if (!isResident) throw new Error("Unauthorized to pay this due");

    // Dynamic credentials lookup
    const org = await prisma.organization.findUnique({
      where: { id: due.organizationId },
    });

    const keyId = org?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
    const keySecretEncrypted = org?.razorpayKeySecret;
    const keySecret = keySecretEncrypted ? decryptText(keySecretEncrypted) : process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error("Razorpay payment credentials are not configured for this society");
    }

    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(due.amount * 100), // in paise
      currency: "INR",
      receipt: due.id,
    });

    await prisma.maintenanceDue.update({
      where: { id: dueId },
      data: {
        razorpayOrderId: order.id,
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    };
  }

  // 9. Verify Razorpay payment signature
  static async verifyPayment(
    dueId: string,
    userId: string,
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string
  ): Promise<any> {
    const due = await prisma.maintenanceDue.findUnique({
      where: { id: dueId },
      include: {
        flat: {
          include: {
            residents: true,
          },
        },
      },
    });

    if (!due) throw new Error("Due record not found");
    if (due.status === "PAID") throw new Error("This due is already paid");

    const isResident = due.flat.residents.some((r) => r.id === userId);
    if (!isResident) throw new Error("Unauthorized to pay this due");

    const org = await prisma.organization.findUnique({
      where: { id: due.organizationId },
    });

    const keySecretEncrypted = org?.razorpayKeySecret;
    const keySecret = keySecretEncrypted ? decryptText(keySecretEncrypted) : process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("Razorpay key secret not found");
    }

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    return await prisma.maintenanceDue.update({
      where: { id: dueId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
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

  // 11. Search Vehicle by Plate number
  static async searchVehicle(societyId: string, plateNumber: string): Promise<any> {
    const cleanPlate = plateNumber.toUpperCase().replace(/\s+/g, "");
    
    return await prisma.vehicle.findFirst({
      where: {
        organizationId: societyId,
        plateNumber: {
          contains: cleanPlate,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });
  }

  // 12. Send Parking Blocking Notification
  static async notifyVehicleBlocking(societyId: string, senderId: string, vehicleId: string): Promise<any> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        owner: true,
      },
    });

    if (!vehicle || vehicle.organizationId !== societyId) {
      throw new Error("Vehicle not found");
    }

    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const senderName = sender?.name || "A neighbor";
    const title = "Parking Alert: Blocked Vehicle 🚗";
    const body = `Your vehicle ${vehicle.plateNumber} is currently blocking another vehicle. ${senderName} has requested that you move it.`;

    // Save in-app notification
    await prisma.notification.create({
      data: {
        userId: vehicle.ownerId,
        title,
        body,
        type: "GATE_CALL",
        data: JSON.stringify({ vehicleId }),
      },
    });

    // Push to job queue
    const QueueService = require("./queue.service").QueueService;
    await QueueService.pushNotificationJob(vehicle.ownerId, title, body, "GATE_CALL");

    return { success: true };
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
