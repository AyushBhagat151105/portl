import { z } from "zod";

export const createAmenitySchema = z.object({
  name: z.string().min(1, "Amenity name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
});

export const bookAmenitySchema = z.object({
  amenityId: z.string().min(1, "Amenity ID is required"),
  date: z.string().min(1, "Date is required"), // Expecting ISO date string e.g. "2026-07-15"
  timeslot: z.string().min(1, "Timeslot is required"), // e.g. "10:00 AM - 12:00 PM"
  purpose: z.string().optional(),
});

export const respondBookingSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
});
