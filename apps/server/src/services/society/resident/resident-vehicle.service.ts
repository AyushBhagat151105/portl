import prisma from "@portl/db";


export class ResidentVehicleService {
  // Search Vehicle by Plate number
  static async searchVehicle(societyId: string, plateNumber: string): Promise<any> {
    const cleanPlate = plateNumber.toUpperCase().replace(/\s+/g, "");
    
    return await prisma.vehicle.findFirst({
      where: {
        organizationId: societyId,
        plateNumber: {
          contains: cleanPlate,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phoneNumber: true,
          },
        },
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });
  }

  // Send Parking Blocking Notification
  static async notifyVehicleBlocking(societyId: string, senderId: string, vehicleId: string): Promise<any> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        owner: true,
      },
    });

    if (!vehicle || vehicle.organizationId !== societyId) {
      throw new Error("Vehicle not found");
    }

    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const senderName = sender?.name || "A neighbor";
    const title = "Parking Alert: Blocked Vehicle 🚗";
    const body = `Your vehicle ${vehicle.plateNumber} is currently blocking another vehicle. ${senderName} has requested that you move it.`;

    // Save in-app notification
    await prisma.notification.create({
      data: {
        userId: vehicle.ownerId,
        title,
        body,
        type: "GATE_CALL",
        data: JSON.stringify({ vehicleId }),
      },
    });

    // Push to job queue
    const QueueService = require("../common/queue.service").QueueService;
    await QueueService.pushNotificationJob(vehicle.ownerId, title, body, "GATE_CALL");

    return { success: true };
  }
}
