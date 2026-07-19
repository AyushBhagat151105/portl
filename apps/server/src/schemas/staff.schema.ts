import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.string().min(1, "Staff role is required"),
  code: z.string().optional(),
  aadharNumber: z.string().optional().nullable(),
  aadharPublicId: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1, "Staff name is required").optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
  role: z.string().min(1, "Staff role is required").optional(),
  code: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  aadharPublicId: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});
