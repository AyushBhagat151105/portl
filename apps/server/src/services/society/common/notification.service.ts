import prisma from "@portl/db";

function getOptimizedPushImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes("res.cloudinary.com")) {
    const uploadIdx = url.indexOf("/upload/");
    if (uploadIdx !== -1) {
      return url.replace("/upload/", "/upload/c_limit,w_600,q_auto,f_auto/");
    }
    const authIdx = url.indexOf("/authenticated/");
    if (authIdx !== -1) {
      return url.replace("/authenticated/", "/authenticated/c_limit,w_600,q_auto,f_auto/");
    }
  }
  return url;
}

// Helper to push remote notifications using Expo's API
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>,
  imageUrl?: string | null
) {
  console.log(`🔔 [Server Push] Attempting to send push to userId: ${userId}`);
  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
    });
    console.log(`🔔 [Server Push] Found ${tokens.length} registered tokens for user:`, tokens.map(t => t.token));
    if (!tokens.length) {
      console.log(`🔔 [Server Push] Aborted: No tokens registered for user: ${userId}`);
      return;
    }

    const optimizedImageUrl = getOptimizedPushImageUrl(imageUrl);

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      priority: "high",
      channelId: "default",
      data: data || {},
      ...(optimizedImageUrl ? { image: optimizedImageUrl } : {}),
    }));

    console.log("🔔 [Server Push] Sending request to Expo Push API...");
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const resJson = await response.json();
    console.log(`🔔 [Server Push] Expo API response status: ${response.status}`, JSON.stringify(resJson, null, 2));
  } catch (error) {
    console.error("🔔 [Server Push] Failed to send push notification:", error);
  }
}

export class NotificationService {
  // Register push token for user device
  static async registerPushToken(userId: string, token: string): Promise<any> {
    return await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { token, userId },
    });
  }

  // Get notifications logs with cursor pagination (max 30 per page)
  static async getNotifications(
    userId: string,
    params: { cursor?: string; limit?: number } = {}
  ): Promise<{ data: any[]; nextCursor: string | null }> {
    const take = Math.min(params.limit ?? 30, 50);
    const where: any = { userId };
    if (params.cursor) where.id = { lt: params.cursor };

    const items = await prisma.notification.findMany({
      where,
      take: take + 1,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = items.length > take;
    const data = hasMore ? items.slice(0, take) : items;
    return { data, nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null };
  }

  // Mark in-app notification read
  static async markNotificationRead(notificationId: string): Promise<any> {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
