import { z } from "zod";

export const createFdSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  amount: z.number().positive("Amount must be a positive number"),
  interestRate: z.number().positive("Interest rate must be positive").optional(),
  startDate: z.string().datetime("Invalid start date format"),
  maturityDate: z.string().datetime("Invalid maturity date format").optional(),
});

export const updateFdSchema = createFdSchema.partial();
