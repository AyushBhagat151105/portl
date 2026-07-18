import type { Context } from "hono";
import { successResponse, errorResponse } from "../../lib/api-response";
import { TreasuryService } from "../../services/society/treasury.service";
import {
  createBudgetSchema,
  createExpenseSchema,
  createFestivalSchema,
} from "../../schemas/society.schema";

export class TreasuryController {
  // Budget Handlers
  static async getBudgets(c: Context) {
    try {
      const societyId = c.get("societyId");
      const budgets = await TreasuryService.getBudgets(societyId);
      return successResponse(c, budgets);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async createBudget(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createBudgetSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await TreasuryService.createBudget(societyId, {
        title: parsed.data.title,
        allocatedAmount: parsed.data.allocatedAmount,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      });
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Expense Handlers
  static async getExpenses(c: Context) {
    try {
      const societyId = c.get("societyId");
      const category = c.req.query("category");
      const expenses = await TreasuryService.getExpenses(societyId, category);
      return successResponse(c, expenses);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async createExpense(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createExpenseSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await TreasuryService.createExpense(societyId, {
        title: parsed.data.title,
        amount: parsed.data.amount,
        category: parsed.data.category,
        description: parsed.data.description,
        date: new Date(parsed.data.date),
        budgetId: parsed.data.budgetId,
      });
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Festival Handlers
  static async getFestivals(c: Context) {
    try {
      const societyId = c.get("societyId");
      const festivals = await TreasuryService.getFestivals(societyId);
      return successResponse(c, festivals);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async createFestival(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createFestivalSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await TreasuryService.createFestival(societyId, {
        name: parsed.data.name,
        description: parsed.data.description,
        date: new Date(parsed.data.date),
        allocatedBudget: parsed.data.allocatedBudget,
      });
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async getBlockCollectionSummaries(c: Context) {
    try {
      const societyId = c.get("societyId");
      const summaries = await TreasuryService.getBlockCollectionSummaries(societyId);
      return successResponse(c, summaries);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
