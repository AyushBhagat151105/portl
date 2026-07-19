import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { FixedDepositService } from "../../../services/society/treasury/fd.service";
import { createFdSchema } from "../../../schemas/fd.schema";

export class FixedDepositController {
  static async getFixedDeposits(c: Context) {
    try {
      const societyId = c.get("societyId");
      const fds = await FixedDepositService.getFixedDeposits(societyId);
      return successResponse(c, fds);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async createFixedDeposit(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createFdSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await FixedDepositService.createFixedDeposit(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async deleteFixedDeposit(c: Context) {
    try {
      const societyId = c.get("societyId");
      const id = c.req.param("id");
      if (!id) {
        return errorResponse(c, "Fixed deposit ID is required", "VALIDATION_ERROR", 400);
      }
      const result = await FixedDepositService.deleteFixedDeposit(societyId, id);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
