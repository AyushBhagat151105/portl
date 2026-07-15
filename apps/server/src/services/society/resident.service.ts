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

  // 8. Create Razorpay order for due payment
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

    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
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
      keyId: process.env.RAZORPAY_KEY_ID,
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

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
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
}
