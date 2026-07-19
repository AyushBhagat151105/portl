import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { MediaService } from "../../../services/society/common/media.service";


export class MediaController {
  // Get Cloudinary upload signature
  static async getUploadSignature(c: Context) {
    try {
      const userId = c.get("userId");
      const folder = c.req.query("folder") || "profiles";
      const isPrivate = c.req.query("type") === "private";
      const result = await MediaService.getUploadSignature(userId, folder, isPrivate);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get temporary signed download URL for Aadhar card
  static async getAadharUrl(c: Context) {
    try {
      const userId = c.get("userId");
      const url = await MediaService.getAadharUrl(userId);
      if (!url) {
        return errorResponse(c, "Document not found", "NOT_FOUND", 404);
      }
      return successResponse(c, { url });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Delete profile picture avatar
  static async deleteAvatar(c: Context) {
    try {
      const userId = c.get("userId");
      await MediaService.deleteAvatar(userId);
      return successResponse(c, { success: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Delete Aadhar card
  static async deleteAadhar(c: Context) {
    try {
      const userId = c.get("userId");
      await MediaService.deleteAadhar(userId);
      return successResponse(c, { success: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
