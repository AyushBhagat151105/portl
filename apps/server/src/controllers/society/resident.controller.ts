import type { Context } from "hono";
import { successResponse, errorResponse } from "../../lib/api-response";
import { ResidentSocietyService } from "../../services/society/resident.service";
import {
  respondVisitorSchema,
  preApproveGuestSchema,
  bookAmenitySchema,
  votePollSchema,
  verifyPaymentSchema,
  updateProfileSchema,
} from "../../schemas/society.schema";

export class ResidentSocietyController {
  // Get resident's flats
  static async getMyFlats(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await ResidentSocietyService.getMyFlats(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get current profile details
  static async getMyProfile(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await ResidentSocietyService.getMyProfile(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get pending gate calls
  static async getPendingGateCalls(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await ResidentSocietyService.getPendingGateCalls(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Respond to visitor (Approve/Reject)
  static async respondToVisitor(c: Context) {
    try {
      const visitorId = c.req.param("id")!;
      const body = await c.req.json();
      const parsed = respondVisitorSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await ResidentSocietyService.respondToVisitor(visitorId, parsed.data.status);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Generate pre-approved guest passcode
  static async preApproveGuest(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = preApproveGuestSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await ResidentSocietyService.preApproveGuest(userId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Book an amenity
  static async bookAmenity(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = bookAmenitySchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const dateObj = new Date(parsed.data.date);
      const result = await ResidentSocietyService.bookAmenity(userId, {
        amenityId: parsed.data.amenityId,
        date: dateObj,
        timeslot: parsed.data.timeslot,
        purpose: parsed.data.purpose,
      });
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Cast vote on community poll
  static async votePoll(c: Context) {
    try {
      const pollId = c.req.param("id")!;
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = votePollSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await ResidentSocietyService.votePoll(pollId, userId, parsed.data.optionIndex);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get resident's maintenance dues
  static async getMyDues(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await ResidentSocietyService.getMyDues(userId);
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
      const result = await ResidentSocietyService.createRazorpayOrder(dueId, userId);
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

      const result = await ResidentSocietyService.verifyPayment(
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

  // Update profile details
  static async updateMyProfile(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = updateProfileSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await ResidentSocietyService.updateMyProfile(userId, body);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Search vehicle plate
  static async searchVehicle(c: Context) {
    try {
      const societyId = c.get("societyId");
      const plateNumber = c.req.query("plateNumber") || "";
      const result = await ResidentSocietyService.searchVehicle(societyId, plateNumber);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Send blocking alert
  static async notifyVehicleBlocking(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.get("userId");
      const vehicleId = c.req.param("id")!;
      const result = await ResidentSocietyService.notifyVehicleBlocking(societyId, userId, vehicleId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
