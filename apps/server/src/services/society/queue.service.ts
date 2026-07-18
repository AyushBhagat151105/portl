import prisma from "@portl/db";
import { sendPushNotification } from "./common.service";

export class QueueService {
  private static isWorkerRunning = false;
  private static workerInterval: any = null;

  // Add a single notification job to the queue
  static async pushNotificationJob(
    userId: string,
    title: string,
    body: string,
    type: string,
    imageUrl?: string | null
  ) {
    try {
      return await prisma.notificationJob.create({
        data: {
          userId,
          title,
          body,
          type,
          imageUrl: imageUrl || null,
          status: "PENDING",
        },
      });
    } catch (error) {
      console.error("Failed to push notification job to DB:", error);
    }
  }

  // Bulk add notification jobs (e.g. for notices or polls)
  static async pushNotificationJobsBulk(
    userIds: string[],
    title: string,
    body: string,
    type: string,
    imageUrl?: string | null
  ): Promise<any> {
    try {
      if (userIds.length === 0) return;

      const data = userIds.map((userId) => ({
        userId,
        title,
        body,
        type,
        imageUrl: imageUrl || null,
        status: "PENDING" as const,
      }));

      return await prisma.notificationJob.createMany({
        data,
      });
    } catch (error) {
      console.error("Failed to bulk push notification jobs to DB:", error);
    }
  }

  // Start the queue worker loop
  static startQueueWorker(intervalMs = 5000) {
    if (this.isWorkerRunning) {
      console.log("Notification queue worker is already running.");
      return;
    }

    this.isWorkerRunning = true;
    console.log(`Starting notification queue worker (polling every ${intervalMs}ms)...`);

    this.workerInterval = setInterval(async () => {
      await this.processQueueBatch();
    }, intervalMs);
  }

  // Stop the queue worker
  static stopQueueWorker() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
    this.isWorkerRunning = false;
    console.log("Notification queue worker stopped.");
  }

  // Process a batch of pending jobs
  private static async processQueueBatch() {
    try {
      // 1. Fetch next batch of pending jobs
      const pendingJobs = await prisma.notificationJob.findMany({
        where: { status: "PENDING" },
        take: 30,
        orderBy: { createdAt: "asc" },
      });

      if (pendingJobs.length === 0) {
        return;
      }

      const jobIds = pendingJobs.map((job) => job.id);

      // 2. Optimistically lock them to PROCESSING
      await prisma.notificationJob.updateMany({
        where: {
          id: { in: jobIds },
          status: "PENDING",
        },
        data: {
          status: "PROCESSING",
        },
      });

      // 3. Process each job
      for (const job of pendingJobs) {
        try {
          // Increment attempts
          const nextAttempt = job.attempts + 1;

          // Attempt sending push notification
          await sendPushNotification(
            job.userId,
            job.title,
            job.body,
            {
              type: job.type,
              jobId: job.id,
            },
            job.imageUrl
          );

          // Mark as COMPLETED
          await prisma.notificationJob.update({
            where: { id: job.id },
            data: {
              status: "COMPLETED",
              attempts: nextAttempt,
            },
          });
        } catch (jobError: any) {
          console.error(`Error processing notification job ${job.id}:`, jobError);
          const nextAttempt = job.attempts + 1;
          const isMaxAttempts = nextAttempt >= 3;

          // Fail or retry
          await prisma.notificationJob.update({
            where: { id: job.id },
            data: {
              status: isMaxAttempts ? "FAILED" : "PENDING",
              attempts: nextAttempt,
              errorMessage: jobError.message || String(jobError),
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed batch processing in notification queue:", error);
    }
  }
}
