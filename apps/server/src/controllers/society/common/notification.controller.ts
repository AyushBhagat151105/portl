import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { NotificationService } from "../../../services/society/common/notification.service";
import { registerPushTokenSchema } from "../../../schemas/profile.schema";


export class NotificationController {
  // Push notification tokens registration
  static async registerPushToken(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = registerPushTokenSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await NotificationService.registerPushToken(userId, parsed.data.token);
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
      const result = await NotificationService.getNotifications(userId, {
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
      const result = await NotificationService.markNotificationRead(notificationId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
