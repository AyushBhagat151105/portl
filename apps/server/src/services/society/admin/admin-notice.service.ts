import prisma from "@portl/db";
import { QueueService } from "../common/queue.service";
import { destroyAsset } from "../../../lib/cloudinary";


export class AdminNoticeService {
  // Publish a notice and notify all residents
  static async createNotice(
    societyId: string,
    authorId: string,
    data: { title: string; content: string; banner?: string | null; bannerPublicId?: string | null }
  ): Promise<any> {
    const notice = await prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        authorId,
        organizationId: societyId,
        banner: data.banner || null,
        bannerPublicId: data.bannerPublicId || null,
      },
    });

    const members = await prisma.member.findMany({
      where: { organizationId: societyId, role: "resident" },
    });

    const title = "New Notice Alert 📢";
    const body = data.title;

    if (members.length > 0) {
      const notifications = members.map((member) => ({
        userId: member.userId,
        title,
        body,
        type: "NOTICE",
        data: JSON.stringify({ noticeId: notice.id }),
        imageUrl: data.banner || null,
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      const userIds = members.map((m) => m.userId);
      await QueueService.pushNotificationJobsBulk(userIds, title, body, "NOTICE", data.banner || null);
    }

    return notice;
  }

  // Delete notice announcement and its banner from Cloudinary
  static async deleteNotice(societyId: string, noticeId: string): Promise<any> {
    const notice = await prisma.notice.findFirst({
      where: { id: noticeId, organizationId: societyId },
    });
    if (!notice) throw new Error("Notice announcement not found");

    if (notice.bannerPublicId) {
      try {
        await destroyAsset(notice.bannerPublicId, false);
      } catch (err) {
        console.error("Failed to delete notice banner:", err);
      }
    }

    return await prisma.notice.delete({
      where: { id: noticeId },
    });
  }
}
