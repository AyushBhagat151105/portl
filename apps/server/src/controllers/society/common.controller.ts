import type { Context } from "hono";
import { successResponse, errorResponse } from "../../lib/api-response";
import { CommonSocietyService } from "../../services/society/common.service";
import {
  joinSocietySchema,
  registerPushTokenSchema,
} from "../../schemas/society.schema";

export class CommonSocietyController {
  // Notices
  static async getNotices(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await CommonSocietyService.getNotices(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Polls
  static async getPolls(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.get("userId");
      const result = await CommonSocietyService.getPolls(societyId, userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Support Complaints (Helpdesk)
  static async getComplaints(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.get("userId");
      const role = c.get("memberRole");
      const isAdmin = role.toLowerCase() === "admin" || role.toLowerCase() === "owner";

      const result = await CommonSocietyService.getComplaints(societyId, userId, isAdmin);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Amenities list
  static async getAmenities(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await CommonSocietyService.getAmenities(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Staff directory list
  static async getStaff(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await CommonSocietyService.getStaff(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Push notification tokens registration
  static async registerPushToken(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = registerPushTokenSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await CommonSocietyService.registerPushToken(userId, parsed.data.token);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get notifications history logs — paginated
  static async getNotifications(c: Context) {
    try {
      const userId = c.get("userId");
      const { cursor, limit } = c.req.query();
      const result = await CommonSocietyService.getNotifications(userId, {
        cursor: cursor || undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Mark in-app notification read
  static async markNotificationRead(c: Context) {
    try {
      const notificationId = c.req.param("id")!;
      const result = await CommonSocietyService.markNotificationRead(notificationId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get current user active membership
  static async getMembership(c: Context) {
    try {
      const session = c.get("session");
      const userId = session.user.id;
      const result = await CommonSocietyService.getMembership(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Join a society by slug
  static async joinSociety(c: Context) {
    try {
      const session = c.get("session");
      const userId = session.user.id;
      const body = await c.req.json();
      const parsed = joinSocietySchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await CommonSocietyService.joinSociety(userId, parsed.data.slug, parsed.data.role);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get towers and flats layout structure (lean — no residents)
  static async getTowers(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await CommonSocietyService.getTowers(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Lazy-load flats with residents for a specific tower
  static async getTowerFlats(c: Context) {
  try {
    const societyId = c.get("societyId");
    const towerId = c.req.param("id")!;
    const result = await CommonSocietyService.getTowerFlats(towerId, societyId);
    return successResponse(c, result);
  } catch (err: any) {
    return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
  }
}
}
