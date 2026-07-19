import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { ResidentPaymentService } from "../../../services/society/resident/resident-payment.service";
import { verifyPaymentSchema } from "../../../schemas/billing.schema";


export class ResidentPaymentController {
  // Get resident's maintenance dues
  static async getMyDues(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await ResidentPaymentService.getMyDues(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Create a Razorpay order for due payment
  static async createRazorpayOrder(c: Context) {
    try {
      const dueId = c.req.param("id")!;
      const userId = c.get("userId");
      const result = await ResidentPaymentService.createRazorpayOrder(dueId, userId);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Verify Razorpay payment signature
  static async verifyPayment(c: Context) {
    try {
      const dueId = c.req.param("id")!;
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = verifyPaymentSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await ResidentPaymentService.verifyPayment(
        dueId,
        userId,
        parsed.data.razorpay_payment_id,
        parsed.data.razorpay_order_id,
        parsed.data.razorpay_signature
      );
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
