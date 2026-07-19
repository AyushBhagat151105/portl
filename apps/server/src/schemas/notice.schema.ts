import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z.string().min(1, "Notice title is required"),
  content: z.string().min(1, "Notice content is required"),
  banner: z.string().optional().nullable(),
  bannerPublicId: z.string().optional().nullable(),
});
