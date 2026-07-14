import prisma from "@portl/db";
import type { Visitor } from "@portl/db";
import { sendPushNotification } from "./common.service";

export class GuardSocietyService {
  // 1. Search residents by name/email
  static async searchResidents(societyId: string, search: string): Promise<any[]> {
    return await prisma.user.findMany({
      where: {
        flats: {
          some: {
            tower: {
              organizationId: societyId,
            },
          },
        },
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        flats: {
          where: {
            tower: {
              organizationId: societyId,
            },
          },
          select: {
            id: true,
            number: true,
            tower: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // 2. Register visitor at gate (sets status to PENDING)
  static async registerVisitor(
    societyId: string,
    guardId: string,
    data: { name: string; phone: string; purpose?: string; type: "GUEST" | "DELIVERY" | "CAB" | "STAFF"; flatId: string }
  ): Promise<Visitor> {
    const visitor = await prisma.visitor.create({
      data: {
        name: data.name,
        phone: data.phone,
        purpose: data.purpose,
        type: data.type,
        status: "PENDING",
        flatId: data.flatId,
        registeredById: guardId,
        organizationId: societyId,
      },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });

    // Notify residents of target flat
    const flat = await prisma.flat.findUnique({
      where: { id: data.flatId },
      include: { residents: true, tower: true },
    });

    if (flat && flat.residents.length > 0) {
      for (const resident of flat.residents) {
        const title = "Gate Access Request 🔔";
        const body = `${visitor.name} (${data.type.toLowerCase()}) is requesting entry to Flat ${flat.tower.name} - ${flat.number}`;

        await prisma.notification.create({
          data: {
            userId: resident.id,
            title,
            body,
            type: "GATE_CALL",
            data: JSON.stringify({ visitorId: visitor.id }),
          },
        });

        await sendPushNotification(resident.id, title, body, {
          url: `/resident/dashboard?activeVisitorId=${visitor.id}`,
        });
      }
    }

    return visitor;
  }

  // 3. Verify passcode and check in a pre-approved guest
  static async verifyPasscode(societyId: string, guardId: string, code: string): Promise<Visitor | null> {
    const visitor = await prisma.visitor.findFirst({
      where: {
        organizationId: societyId,
        preApprovedCode: code,
        status: "PENDING",
      },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });

    if (!visitor) {
      return null;
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id: visitor.id },
      data: {
        status: "APPROVED",
        enteredAt: new Date(),
        registeredById: guardId,
      },
    });

    // Notify residents
    const flat = await prisma.flat.findUnique({
      where: { id: visitor.flatId },
      include: { residents: true, tower: true },
    });

    if (flat && flat.residents.length > 0) {
      for (const resident of flat.residents) {
        const title = "Guest Entered Gate 🚪";
        const body = `Pre-approved guest ${visitor.name} has checked into Flat ${flat.tower.name} - ${flat.number}`;

        await prisma.notification.create({
          data: {
            userId: resident.id,
            title,
            body,
            type: "GATE_CALL",
            data: JSON.stringify({ visitorId: visitor.id }),
          },
        });

        await sendPushNotification(resident.id, title, body, {
          url: `/resident/notifications`,
        });
      }
    }

    return updatedVisitor;
  }

  // 4. Mark visitor checkout exit
  static async markVisitorExit(visitorId: string): Promise<Visitor | null> {
    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });
    if (!visitor) return null;

    const updated = await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        status: "EXITED",
        exitedAt: new Date(),
      },
    });

    // Notify residents
    const flat = await prisma.flat.findUnique({
      where: { id: visitor.flatId },
      include: { residents: true },
    });

    if (flat && flat.residents.length > 0) {
      for (const resident of flat.residents) {
        const title = "Visitor Checked Out 👋";
        const body = `${visitor.name} has exited the society gate.`;

        await prisma.notification.create({
          data: {
            userId: resident.id,
            title,
            body,
            type: "GATE_CALL",
            data: JSON.stringify({ visitorId: visitor.id }),
          },
        });

        await sendPushNotification(resident.id, title, body, {
          url: `/resident/notifications`,
        });
      }
    }

    return updated;
  }

  // 5. List active visitor entries inside the gate (APPROVED or PENDING)
  static async getActiveVisitors(societyId: string): Promise<Visitor[]> {
    return await prisma.visitor.findMany({
      where: {
        organizationId: societyId,
        status: { in: ["APPROVED", "PENDING"] },
      },
      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 6. Get visitor checkout logs history (EXITED or REJECTED)
  static async getVisitorHistory(societyId: string): Promise<any[]> {
    return await prisma.visitor.findMany({
      where: {
        organizationId: societyId,
        status: { in: ["EXITED", "REJECTED"] },
      },
      include: {
        flat: { include: { tower: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
  }
}
