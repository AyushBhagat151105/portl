import prisma from "@portl/db";
import { decryptText } from "../../../lib/crypto";


export class ResidentPaymentService {
  // Get resident's maintenance dues
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

  // Create Razorpay order for due payment using Dynamic Credentials
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

  // Verify Razorpay payment signature
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
}
