import { z } from "zod";

export const createBudgetSchema = z.object({
  title: z.string().min(1, "Budget title is required"),
  allocatedAmount: z.number().positive("Amount must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Expense title is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["MAINTENANCE", "UTILITIES", "SALARIES", "FESTIVAL", "REPAIRS", "OTHERS"]),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  budgetId: z.string().optional().nullable(),
});

export const createFestivalSchema = z.object({
  name: z.string().min(1, "Festival name is required"),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  allocatedBudget: z.number().positive().optional(),
});
