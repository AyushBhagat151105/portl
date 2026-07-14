import type { Context } from "hono";
import { successResponse, errorResponse } from "../../lib/api-response";
import { AdminSocietyService } from "../../services/society/admin.service";
import {
  setupSocietySchema,
  createNoticeSchema,
  createPollSchema,
  updateComplaintSchema,
  createAmenitySchema,
  createStaffSchema,
  assignFlatSchema,
} from "../../schemas/society.schema";

export class AdminSocietyController {
  // Setup society structure (Towers & Flats)
  static async setupSociety(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = setupSocietySchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminSocietyService.setupSociety(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Assign flat to resident
  static async assignFlat(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = assignFlatSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminSocietyService.assignFlat(societyId, parsed.data.userId, parsed.data.flatId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get members list
  static async getMembers(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await AdminSocietyService.getMembers(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

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

      const result = await AdminSocietyService.createNotice(societyId, authorId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Create poll
  static async createPoll(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createPollSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminSocietyService.createPoll(societyId, parsed.data);
      return successResponse(c, result, 201);
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

      const result = await AdminSocietyService.updateComplaint(complaintId, parsed.data.status);
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

      const result = await AdminSocietyService.createAmenity(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Create staff provider
  static async createStaff(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createStaffSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminSocietyService.createStaff(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Remove staff provider
  static async deleteStaff(c: Context) {
    try {
      const staffId = c.req.param("id")!;
      await AdminSocietyService.deleteStaff(staffId);
      return successResponse(c, { deleted: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
