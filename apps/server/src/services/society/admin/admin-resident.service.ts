import prisma from "@portl/db";
import { destroyAsset, extractPublicId, generateSignedDownloadUrl } from "../../../lib/cloudinary";


export class AdminResidentService {
  // Get all members of a society — includes full profiles
  static async getMembers(societyId: string): Promise<any[]> {
    return await prisma.member.findMany({
      where: { organizationId: societyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            aadharNumber: true,
            aadharPublicId: true,
            vehicleNumber: true,
            vehicles: true,
            flats: {
              where: { tower: { organizationId: societyId } },
              select: {
                id: true,
                number: true,
                occupancyStatus: true,
                memberCount: true,
                vehicleMemberCount: true,
                tower: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // Create Resident Manually
  static async createResident(
    societyId: string,
    data: { name: string; email: string; phone?: string; aadharNumber?: string; image?: string; aadharPublicId?: string }
  ): Promise<any> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    let user = existing;
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          aadharNumber: data.aadharNumber,
          image: data.image,
          aadharPublicId: data.aadharPublicId,
        },
      });
    }

    const existingMember = await prisma.member.findFirst({
      where: { userId: user.id, organizationId: societyId },
    });

    if (!existingMember) {
      await prisma.member.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          organizationId: societyId,
          role: "resident",
        },
      });
    }

    return user;
  }

  // Update Resident Profile
  static async updateResident(
    userId: string,
    data: { name?: string; email?: string; aadharNumber?: string | null; image?: string | null; aadharPublicId?: string | null }
  ): Promise<any> {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true, aadharPublicId: true },
    });

    // 1. If avatar image has changed or is deleted, destroy old Cloudinary asset
    if (data.image !== undefined && data.image !== currentUser?.image && currentUser?.image) {
      const oldPublicId = extractPublicId(currentUser.image);
      if (oldPublicId) {
        await destroyAsset(oldPublicId, false);
      }
    }

    // 2. If Aadhar file has changed or is deleted, destroy old secure Cloudinary asset
    if (data.aadharPublicId !== undefined && data.aadharPublicId !== currentUser?.aadharPublicId && currentUser?.aadharPublicId) {
      await destroyAsset(currentUser.aadharPublicId, true);
    }

    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // Get temporary signed download URL for resident Aadhar card (Admin)
  static async getResidentAadharUrl(societyId: string, userId: string): Promise<string | null> {
    const member = await prisma.member.findFirst({
      where: { userId, organizationId: societyId },
      include: { user: { select: { aadharPublicId: true } } },
    });
    if (!member?.user?.aadharPublicId) return null;
    return generateSignedDownloadUrl(member.user.aadharPublicId);
  }

  // Delete Resident / Remove from society
  static async deleteResident(societyId: string, userId: string): Promise<any> {
    // Remove member link
    await prisma.member.deleteMany({
      where: { userId, organizationId: societyId },
    });

    // Disconnect flat assignments in this society
    const flats = await prisma.flat.findMany({
      where: {
        tower: { organizationId: societyId },
        residents: { some: { id: userId } },
      },
      select: { id: true },
    });

    if (flats.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          flats: {
            disconnect: flats.map((f) => ({ id: f.id })),
          },
        },
      });
    }

    return { deleted: true };
  }
}
