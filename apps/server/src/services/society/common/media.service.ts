import prisma from "@portl/db";
import { generateUploadSignature, generateSignedDownloadUrl, destroyAsset, extractPublicId } from "../../../lib/cloudinary";


export class MediaService {
  // Cloudinary Signed Upload parameters
  static async getUploadSignature(_userId: string, folder: string, isPrivate: boolean) {
    const type = isPrivate ? "authenticated" : "upload";
    return generateUploadSignature(folder, type);
  }

  // Get temporary signed download URL for Aadhar card
  static async getAadharUrl(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aadharPublicId: true },
    });
    if (!user?.aadharPublicId) return null;
    return generateSignedDownloadUrl(user.aadharPublicId);
  }

  // Delete profile picture avatar
  static async deleteAvatar(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    if (user?.image) {
      const publicId = extractPublicId(user.image);
      if (publicId) {
        await destroyAsset(publicId, false);
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });
    return true;
  }

  // Delete Aadhar card
  static async deleteAadhar(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aadharPublicId: true },
    });
    if (user?.aadharPublicId) {
      await destroyAsset(user.aadharPublicId, true);
    }
    await prisma.user.update({
      where: { id: userId },
      data: { aadharNumber: null, aadharPublicId: null },
    });
    return true;
  }
}
