import type { Context } from "hono";
import { successResponse, errorResponse } from "../../lib/api-response";
import { GuardSocietyService } from "../../services/society/guard.service";
import {
  registerVisitorSchema,
  verifyPasscodeSchema,
} from "../../schemas/society.schema";

export class GuardSocietyController {
  // Search residents
  static async searchResidents(c: Context) {
    try {
      const societyId = c.get("societyId");
      const query = c.req.query("search") || "";
      const result = await GuardSocietyService.searchResidents(societyId, query);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Register visitor entry
  static async registerVisitor(c: Context) {
    try {
      const societyId = c.get("societyId");
      const guardId = c.get("userId");
      const body = await c.req.json();
      const parsed = registerVisitorSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await GuardSocietyService.registerVisitor(societyId, guardId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Verify guest passcode
  static async verifyPasscode(c: Context) {
    try {
      const societyId = c.get("societyId");
      const guardId = c.get("userId");
      const body = await c.req.json();
      const parsed = verifyPasscodeSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await GuardSocietyService.verifyPasscode(societyId, guardId, parsed.data.code);
      if (!result) {
        return errorResponse(c, "Invalid passcode or guest already checked in", "NOT_FOUND", 404);
      }
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Mark visitor check-out
  static async markVisitorExit(c: Context) {
    try {
      const visitorId = c.req.param("id")!;
      const result = await GuardSocietyService.markVisitorExit(visitorId);
      if (!result) {
        return errorResponse(c, "Visitor log entry not found", "NOT_FOUND", 404);
      }
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get active visitor entries
  static async getActiveVisitors(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await GuardSocietyService.getActiveVisitors(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get historical logs
  static async getVisitorHistory(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await GuardSocietyService.getVisitorHistory(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
