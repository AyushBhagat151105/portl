import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  aadharNumber: z.string().length(12, "Aadhar must be exactly 12 digits").regex(/^\d+$/, "Aadhar must be digits only").optional().nullable(),
  image: z.string().optional().nullable(),
});

export const registerVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  makeModel: z.string().optional().nullable(),
  type: z.enum(["CAR", "BIKE"]),
  flatId: z.string().optional().nullable(),
});

export const registerPushTokenSchema = z.object({
  token: z.string().min(1, "Push token is required"),
});

export const joinSocietySchema = z.object({
  slug: z.string().min(1, "Society slug is required"),
  role: z.enum(["resident", "guard"] as const).refine((v) => ["resident", "guard"].includes(v), {
    message: "Role must be resident or guard",
  }),
});
