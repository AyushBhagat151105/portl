import { z } from "zod";

export const registerVisitorSchema = z.object({
  name: z.string().min(1, "Visitor name is required"),
  phone: z.string().min(1, "Visitor phone is required"),
  purpose: z.string().optional(),
  type: z.enum(["GUEST", "DELIVERY", "CAB", "STAFF"]),
  flatId: z.string().min(1, "Flat ID is required"),
});

export const verifyPasscodeSchema = z.object({
  code: z.string().length(6, "Passcode must be exactly 6 characters"),
});

export const respondVisitorSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const preApproveGuestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  phone: z.string().min(1, "Guest phone is required"),
  purpose: z.string().optional(),
  flatId: z.string().min(1, "Flat ID is required"),
});
