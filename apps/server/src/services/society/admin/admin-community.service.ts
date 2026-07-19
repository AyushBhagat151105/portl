import prisma from "@portl/db";
import { QueueService } from "../common/queue.service";


export class AdminCommunityService {
  // Create a community voting poll and notify all residents
  static async createPoll(societyId: string, data: { question: string; options: string[] }): Promise<any> {
    const poll = await prisma.poll.create({
      data: {
        question: data.question,
        options: data.options,
        organizationId: societyId,
      },
    });

    const members = await prisma.member.findMany({
      where: { organizationId: societyId, role: "resident" },
    });

    const title = "New Community Poll 📊";
    const body = data.question;

    if (members.length > 0) {
      const notifications = members.map((member) => ({
        userId: member.userId,
        title,
        body,
        type: "POLL",
        data: JSON.stringify({ pollId: poll.id }),
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      const userIds = members.map((m) => m.userId);
      await QueueService.pushNotificationJobsBulk(userIds, title, body, "POLL");
    }

    return poll;
  }

  // Close a community poll
  static async closePoll(societyId: string, pollId: string): Promise<any> {
    return await prisma.poll.update({
      where: { id: pollId, organizationId: societyId },
      data: { status: "CLOSED" },
    });
  }

  // Update support complaint ticket status and notify creator
  static async updateComplaint(complaintId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED"): Promise<any> {
    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    });

    const title = "Complaint Ticket Updated 🛠️";
    const body = `Your complaint "${complaint.title}" is now marked as ${status.replace("_", " ").toLowerCase()}`;

    await prisma.notification.create({
      data: {
        userId: complaint.raisedById,
        title,
        body,
        type: "COMPLAINT",
        data: JSON.stringify({ complaintId }),
      },
    });

    await QueueService.pushNotificationJob(complaint.raisedById, title, body, "COMPLAINT");

    return complaint;
  }

  // Create a new amenity
  static async createAmenity(
    societyId: string,
    data: { name: string; description?: string; location?: string; capacity?: number }
  ): Promise<any> {
    return await prisma.amenity.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        capacity: data.capacity,
        organizationId: societyId,
      },
    });
  }

  // Retrieve all Amenity/Event Booking requests
  static async getBookingRequests(societyId: string): Promise<any[]> {
    return await prisma.amenityBooking.findMany({
      where: {
        amenity: { organizationId: societyId },
      },
      include: {
        amenity: true,
        bookedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  // Respond to booking request
  static async respondToBookingRequest(
    bookingId: string,
    status: "APPROVED" | "REJECTED" | "CANCELLED"
  ): Promise<any> {
    const booking = await prisma.amenityBooking.update({
      where: { id: bookingId },
      data: { status },
      include: { amenity: true },
    });

    // Notify applicant
    const title = `Event Booking status: ${status} 📅`;
    const body = `Your request to book "${booking.amenity.name}" on ${new Date(booking.date).toLocaleDateString()} is ${status.toLowerCase()}`;

    await prisma.notification.create({
      data: {
        userId: booking.bookedById,
        title,
        body,
        type: "AMENITY",
        data: JSON.stringify({ bookingId }),
      },
    });

    await QueueService.pushNotificationJob(booking.bookedById, title, body, "AMENITY");

    return booking;
  }
}
