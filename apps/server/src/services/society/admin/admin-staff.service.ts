import prisma from "@portl/db";
import { destroyAsset, extractPublicId, generateSignedDownloadUrl } from "../../../lib/cloudinary";


export class AdminStaffService {
  // Create a new staff directory provider
  static async createStaff(
    societyId: string,
    data: { name: string; phone: string; role: string; code?: string; aadharNumber?: string; aadharPublicId?: string; vehicleNumber?: string; avatar?: string }
  ): Promise<any> {
    return await prisma.staffProvider.create({
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        code: data.code,
        aadharNumber: data.aadharNumber,
        aadharPublicId: data.aadharPublicId,
        vehicleNumber: data.vehicleNumber,
        avatar: data.avatar,
        organizationId: societyId,
      },
    });
  }

  // Remove a staff provider
  static async deleteStaff(staffId: string): Promise<any> {
    const staff = await prisma.staffProvider.findUnique({
      where: { id: staffId },
      select: { avatar: true, aadharPublicId: true },
    });

    if (staff) {
      if (staff.avatar) {
        const publicId = extractPublicId(staff.avatar);
        if (publicId) {
          await destroyAsset(publicId, false);
        }
      }
      if (staff.aadharPublicId) {
        await destroyAsset(staff.aadharPublicId, true);
      }
    }

    return await prisma.staffProvider.delete({
      where: { id: staffId },
    });
  }

  // Update a staff provider
  static async updateStaff(
    staffId: string,
    data: { name?: string; phone?: string; role?: string; code?: string | null; aadharNumber?: string | null; aadharPublicId?: string | null; vehicleNumber?: string | null; avatar?: string | null }
  ): Promise<any> {
    const currentStaff = await prisma.staffProvider.findUnique({
      where: { id: staffId },
      select: { avatar: true, aadharPublicId: true },
    });

    if (currentStaff) {
      // If avatar has changed, delete old one
      if (data.avatar !== undefined && data.avatar !== currentStaff.avatar && currentStaff.avatar) {
        const oldPublicId = extractPublicId(currentStaff.avatar);
        if (oldPublicId) {
          await destroyAsset(oldPublicId, false);
        }
      }
      // If Aadhar file has changed, delete old one
      if (data.aadharPublicId !== undefined && data.aadharPublicId !== currentStaff.aadharPublicId && currentStaff.aadharPublicId) {
        await destroyAsset(currentStaff.aadharPublicId, true);
      }
    }

    return await prisma.staffProvider.update({
      where: { id: staffId },
      data,
    });
  }

  // Get temporary signed download URL for staff Aadhar card
  static async getStaffAadharUrl(societyId: string, staffId: string): Promise<string | null> {
    const staff = await prisma.staffProvider.findFirst({
      where: { id: staffId, organizationId: societyId },
      select: { aadharPublicId: true },
    });
    if (!staff?.aadharPublicId) return null;
    return generateSignedDownloadUrl(staff.aadharPublicId);
  }

  // Delete staff profile photo (avatar)
  static async deleteStaffAvatar(societyId: string, staffId: string): Promise<boolean> {
    const staff = await prisma.staffProvider.findFirst({
      where: { id: staffId, organizationId: societyId },
      select: { avatar: true },
    });
    if (staff?.avatar) {
      const publicId = extractPublicId(staff.avatar);
      if (publicId) {
        await destroyAsset(publicId, false);
      }
    }
    await prisma.staffProvider.update({
      where: { id: staffId },
      data: { avatar: null },
    });
    return true;
  }

  // Delete staff Aadhar document
  static async deleteStaffAadhar(societyId: string, staffId: string): Promise<boolean> {
    const staff = await prisma.staffProvider.findFirst({
      where: { id: staffId, organizationId: societyId },
      select: { aadharPublicId: true },
    });
    if (staff?.aadharPublicId) {
      await destroyAsset(staff.aadharPublicId, true);
    }
    await prisma.staffProvider.update({
      where: { id: staffId },
      data: { aadharNumber: null, aadharPublicId: null },
    });
    return true;
  }
}
