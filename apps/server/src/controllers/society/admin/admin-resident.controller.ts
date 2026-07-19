import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { AdminResidentService } from "../../../services/society/admin/admin-resident.service";


export class AdminResidentController {
  // Get members list
  static async getMembers(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await AdminResidentService.getMembers(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Create resident manually
  static async createResident(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      // Using generic schema fields or checking email
      if (!body.email || !body.name) {
        return errorResponse(c, "Name and Email are required", "VALIDATION_ERROR", 400);
      }
      const result = await AdminResidentService.createResident(societyId, body);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Update resident profile
  static async updateResident(c: Context) {
    try {
      const userId = c.req.param("id")!;
      const body = await c.req.json();
      const result = await AdminResidentService.updateResident(userId, body);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Delete resident
  static async deleteResident(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.req.param("id")!;
      const result = await AdminResidentService.deleteResident(societyId, userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get temporary signed download URL for resident Aadhar card (Admin)
  static async getResidentAadharUrl(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.req.param("id")!;
      const url = await AdminResidentService.getResidentAadharUrl(societyId, userId);
      if (!url) {
        return errorResponse(c, "Resident Aadhar document not found", "NOT_FOUND", 404);
      }
      return successResponse(c, { url });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
