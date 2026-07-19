import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { AdminStaffService } from "../../../services/society/admin/admin-staff.service";
import { createStaffSchema, updateStaffSchema } from "../../../schemas/staff.schema";


export class AdminStaffController {
  // Create staff provider
  static async createStaff(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createStaffSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminStaffService.createStaff(societyId, {
        name: parsed.data.name,
        phone: parsed.data.phone,
        role: parsed.data.role,
        code: parsed.data.code,
        aadharNumber: parsed.data.aadharNumber || undefined,
        vehicleNumber: parsed.data.vehicleNumber || undefined,
        avatar: parsed.data.avatar || undefined,
      });
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Remove staff provider
  static async deleteStaff(c: Context) {
    try {
      const staffId = c.req.param("id")!;
      await AdminStaffService.deleteStaff(staffId);
      return successResponse(c, { deleted: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Update staff provider
  static async updateStaff(c: Context) {
    try {
      const staffId = c.req.param("id")!;
      const body = await c.req.json();
      const parsed = updateStaffSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }
      const result = await AdminStaffService.updateStaff(staffId, parsed.data);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get temporary signed download URL for staff Aadhar card
  static async getStaffAadharUrl(c: Context) {
    try {
      const societyId = c.get("societyId");
      const staffId = c.req.param("id")!;
      const url = await AdminStaffService.getStaffAadharUrl(societyId, staffId);
      if (!url) {
        return errorResponse(c, "Staff Aadhar document not found", "NOT_FOUND", 404);
      }
      return successResponse(c, { url });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Delete staff profile photo
  static async deleteStaffAvatar(c: Context) {
    try {
      const societyId = c.get("societyId");
      const staffId = c.req.param("id")!;
      const result = await AdminStaffService.deleteStaffAvatar(societyId, staffId);
      return successResponse(c, { success: result });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Delete staff Aadhar document
  static async deleteStaffAadhar(c: Context) {
    try {
      const societyId = c.get("societyId");
      const staffId = c.req.param("id")!;
      const result = await AdminStaffService.deleteStaffAadhar(societyId, staffId);
      return successResponse(c, { success: result });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
