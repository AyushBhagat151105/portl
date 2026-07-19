import { z } from "zod";

export const setupSocietySchema = z.object({
  towers: z.array(
    z.object({
      name: z.string().min(1, "Tower name is required"),
      flats: z.array(z.string().min(1, "Flat number is required")),
    })
  ),
});

export const assignFlatSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  flatId: z.string().min(1, "Flat ID is required"),
});

export const allocateFlatSchema = z.object({
  flatId: z.string().min(1, "Flat ID is required"),
  ownerId: z.string().optional().nullable(),
  occupancyStatus: z.enum(["VACANT", "OWNER_OCCUPIED", "RENTED"]),
  memberCount: z.number().int().nonnegative().optional(),
  vehicleMemberCount: z.number().int().nonnegative().optional(),
  residentIds: z.array(z.string()).optional(),
});
