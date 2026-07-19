import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { AdminBillingService } from "../../../services/society/admin/admin-billing.service";
import { generateDuesSchema, updatePaymentConfigSchema } from "../../../schemas/billing.schema";


export class AdminBillingController {
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
      const result = await AdminBillingService.generateDues(
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
      const result = await AdminBillingService.getDues(societyId, {
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
      const result = await AdminBillingService.markDuePaidOffline(dueId);
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
      await AdminBillingService.updatePaymentConfig(societyId, parsed.data);
      return successResponse(c, { success: true });
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Get dynamic payment config
  static async getPaymentConfig(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await AdminBillingService.getPaymentConfig(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
