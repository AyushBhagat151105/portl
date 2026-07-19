import { z } from "zod";

export const createPollSchema = z.object({
  question: z.string().min(1, "Poll question is required"),
  options: z.array(z.string().min(1)).min(2, "At least two options are required"),
});

export const votePollSchema = z.object({
  optionIndex: z.number().int().nonnegative("Option index must be a non-negative integer"),
});
