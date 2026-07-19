import prisma from "@portl/db";


export class AdminSetupService {
  // 1. Setup society flats and towers (Upsert-safe: updates structures if already existing)
  static async setupSociety(societyId: string, data: { towers: { name: string; flats: string[] }[] }): Promise<any[]> {
    return await prisma.$transaction(async (tx) => {
      const results = [];
      for (const t of data.towers) {
        // Find existing tower or create it
        let tower = await tx.tower.findFirst({
          where: { name: t.name, organizationId: societyId },
        });
        if (!tower) {
          tower = await tx.tower.create({
            data: {
              name: t.name,
              organizationId: societyId,
            },
          });
        }

        // Add flats under this tower (skip if already exists)
        for (const num of t.flats) {
          const existingFlat = await tx.flat.findFirst({
            where: { number: num, towerId: tower.id },
          });
          if (!existingFlat) {
            await tx.flat.create({
              data: {
                number: num,
                towerId: tower.id,
              },
            });
          }
        }
        results.push(tower);
      }
      return results;
    });
  }

  // 2. Assign a resident to a flat
  static async assignFlat(societyId: string, userId: string, flatId: string): Promise<any> {
    const flat = await prisma.flat.findUnique({
      where: { id: flatId },
      include: { tower: true },
    });
    if (!flat || flat.tower.organizationId !== societyId) {
      throw new Error("Flat not found in this society");
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        flats: {
          connect: { id: flatId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        flats: {
          where: { tower: { organizationId: societyId } },
          include: { tower: true },
        },
      },
    });
  }

  // 16. Flexible Flat Allocation
  static async allocateFlat(
    societyId: string,
    data: {
      flatId: string;
      ownerId?: string | null;
      occupancyStatus: string;
      memberCount?: number;
      vehicleMemberCount?: number;
      residentIds?: string[];
    }
  ): Promise<any> {
    const flat = await prisma.flat.findUnique({
      where: { id: data.flatId },
      include: { tower: true },
    });

    if (!flat || flat.tower.organizationId !== societyId) {
      throw new Error("Flat not found in this society");
    }

    return await prisma.flat.update({
      where: { id: data.flatId },
      data: {
        ownerId: data.ownerId || null,
        occupancyStatus: data.occupancyStatus,
        memberCount: data.memberCount ?? 0,
        vehicleMemberCount: data.vehicleMemberCount ?? 0,
        residents: {
          set: data.residentIds ? data.residentIds.map((id) => ({ id })) : [],
        },
      },
      include: {
        residents: true,
        owner: true,
      },
    });
  }
}
