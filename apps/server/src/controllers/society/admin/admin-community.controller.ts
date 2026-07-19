import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { AdminCommunityService } from "../../../services/society/admin/admin-community.service";
import { createPollSchema } from "../../../schemas/poll.schema";
import { updateComplaintSchema } from "../../../schemas/complaint.schema";
import { createAmenitySchema, respondBookingSchema } from "../../../schemas/amenity.schema";


export class AdminCommunityController {
  // Create poll
  static async createPoll(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createPollSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminCommunityService.createPoll(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Close poll
  static async closePoll(c: Context) {
    try {
      const societyId = c.get("societyId");
      const pollId = c.req.param("id")!;
      await AdminCommunityService.closePoll(societyId, pollId);
      return successResponse(c, { success: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Update complaint ticket status
  static async updateComplaint(c: Context) {
    try {
      const complaintId = c.req.param("id")!;
      const body = await c.req.json();
      const parsed = updateComplaintSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminCommunityService.updateComplaint(complaintId, parsed.data.status);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Create amenity
  static async createAmenity(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createAmenitySchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminCommunityService.createAmenity(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Retrieve amenity requests
  static async getBookingRequests(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await AdminCommunityService.getBookingRequests(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Respond to booking requests
  static async respondToBookingRequest(c: Context) {
    try {
      const bookingId = c.req.param("id")!;
      const body = await c.req.json();
      const parsed = respondBookingSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }
      const result = await AdminCommunityService.respondToBookingRequest(bookingId, parsed.data.status);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
