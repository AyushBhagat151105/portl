import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { AdminSetupService } from "../../../services/society/admin/admin-setup.service";
import { setupSocietySchema, assignFlatSchema, allocateFlatSchema } from "../../../schemas/admin-setup.schema";


export class AdminSetupController {
  // Setup society structure (Towers & Flats)
  static async setupSociety(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = setupSocietySchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await AdminSetupService.setupSociety(societyId, parsed.data);
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

      const result = await AdminSetupService.assignFlat(societyId, parsed.data.userId, parsed.data.flatId);
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
      const result = await AdminSetupService.allocateFlat(societyId, parsed.data);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
