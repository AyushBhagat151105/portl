import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { AdminNoticeService } from "../../../services/society/admin/admin-notice.service";
import { createNoticeSchema } from "../../../schemas/notice.schema";


export class AdminNoticeController {
  // Publish notice
  static async createNotice(c: Context) {
    try {
      const societyId = c.get("societyId");
      const authorId = c.get("userId");
      const body = await c.req.json();
      const parsed = createNoticeSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminNoticeService.createNotice(societyId, authorId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Delete notice
  static async deleteNotice(c: Context) {
    try {
      const societyId = c.get("societyId");
      const noticeId = c.req.param("id")!;
      await AdminNoticeService.deleteNotice(societyId, noticeId);
      return successResponse(c, { success: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
