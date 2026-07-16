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
  updateStaffSchema,
  assignFlatSchema,
  allocateFlatSchema,
  generateDuesSchema,
  updatePaymentConfigSchema,
  respondBookingSchema,
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

  // Close poll
  static async closePoll(c: Context) {
    try {
      const societyId = c.get("societyId");
      const pollId = c.req.param("id")!;
      await AdminSocietyService.closePoll(societyId, pollId);
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

      const result = await AdminSocietyService.createStaff(societyId, {
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
      await AdminSocietyService.deleteStaff(staffId);
      return successResponse(c, { deleted: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Generate maintenance dues for all flats
  static async generateDues(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = generateDuesSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const dueDateObj = new Date(parsed.data.dueDate);
      const result = await AdminSocietyService.generateDues(
        societyId,
        parsed.data.amount,
        parsed.data.month,
        dueDateObj
      );
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get maintenance dues logs — paginated with optional month/status filters
  static async getDues(c: Context) {
    try {
      const societyId = c.get("societyId");
      const { cursor, limit, month, status } = c.req.query();
      const result = await AdminSocietyService.getDues(societyId, {
        cursor: cursor || undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        month: month || undefined,
        status: status || undefined,
      });
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Mark bill paid offline
  static async markDuePaidOffline(c: Context) {
    try {
      const dueId = c.req.param("id")!;
      const result = await AdminSocietyService.markDuePaidOffline(dueId);
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
      const result = await AdminSocietyService.createResident(societyId, body);
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
      const result = await AdminSocietyService.updateResident(userId, body);
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
      const result = await AdminSocietyService.deleteResident(societyId, userId);
      return successResponse(c, result);
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
      const result = await AdminSocietyService.updateStaff(staffId, parsed.data);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Allocate flat occupancy and parameters
  static async allocateFlat(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = allocateFlatSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }
      const result = await AdminSocietyService.allocateFlat(societyId, parsed.data);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Update dynamic payment config
  static async updatePaymentConfig(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = updatePaymentConfigSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }
      await AdminSocietyService.updatePaymentConfig(societyId, parsed.data);
      return successResponse(c, { success: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get dynamic payment config
  static async getPaymentConfig(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await AdminSocietyService.getPaymentConfig(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Retrieve amenity requests
  static async getBookingRequests(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await AdminSocietyService.getBookingRequests(societyId);
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
      const result = await AdminSocietyService.respondToBookingRequest(bookingId, parsed.data.status);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
