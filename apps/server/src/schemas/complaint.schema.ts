import { z } from "zod";

export const raiseComplaintSchema = z.object({
  title: z.string().min(1, "Complaint title is required"),
  description: z.string().min(1, "Complaint description is required"),
  category: z.enum(["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"]),
  flatId: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]),
});
