import type { Context } from "hono";
import { successResponse, errorResponse } from "../lib/api-response";
import { SocietyService } from "../services/society.service";
import {
  setupSocietySchema,
  createNoticeSchema,
  createPollSchema,
  votePollSchema,
  raiseComplaintSchema,
  updateComplaintSchema,
  registerVisitorSchema,
  verifyPasscodeSchema,
  respondVisitorSchema,
  preApproveGuestSchema,
  bookAmenitySchema,
  registerPushTokenSchema,
} from "../schemas/society.schema";

export class SocietyController {
  // 1. Setup towers and flats inside society
  static async setupSociety(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = setupSocietySchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.setupSociety(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 2. Search residents (guards and admins)
  static async searchResidents(c: Context) {
    try {
      const societyId = c.get("societyId");
      const query = c.req.query("search") || "";
      const result = await SocietyService.searchResidents(societyId, query);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 3. Register visitor at gate (creates PENDING entry)
  static async registerVisitor(c: Context) {
    try {
      const societyId = c.get("societyId");
      const guardId = c.get("userId");
      const body = await c.req.json();
      const parsed = registerVisitorSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.registerVisitor(societyId, guardId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 4. Verify passcode (pre-approved guests)
  static async verifyPasscode(c: Context) {
    try {
      const societyId = c.get("societyId");
      const guardId = c.get("userId");
      const body = await c.req.json();
      const parsed = verifyPasscodeSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.verifyPasscode(societyId, guardId, parsed.data.code);
      if (!result) {
        return errorResponse(c, "Invalid passcode or guest already checked in", "NOT_FOUND", 404);
      }
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 5. Mark visitor exit
  static async markVisitorExit(c: Context) {
    try {
      const visitorId = c.req.param("id")!;
      const result = await SocietyService.markVisitorExit(visitorId);
      if (!result) {
        return errorResponse(c, "Visitor log entry not found", "NOT_FOUND", 404);
      }
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 6. Retrieve active logs at the gate (inside society)
  static async getActiveVisitors(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await SocietyService.getActiveVisitors(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 7. Get pending gate approvals (Residents notifications list)
  static async getPendingGateCalls(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await SocietyService.getPendingGateCalls(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 8. Respond to visitor (Approve/Reject)
  static async respondToVisitor(c: Context) {
    try {
      const visitorId = c.req.param("id")!;
      const body = await c.req.json();
      const parsed = respondVisitorSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.respondToVisitor(visitorId, parsed.data.status);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 9. Create pre-approved code for guest
  static async preApproveGuest(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = preApproveGuestSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.preApproveGuest(userId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 10. Notices (GET, POST)
  static async getNotices(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await SocietyService.getNotices(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async createNotice(c: Context) {
    try {
      const societyId = c.get("societyId");
      const authorId = c.get("userId");
      const body = await c.req.json();
      const parsed = createNoticeSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.createNotice(societyId, authorId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 11. Polls (GET, POST, VOTE)
  static async getPolls(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.get("userId");
      const result = await SocietyService.getPolls(societyId, userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async votePoll(c: Context) {
    try {
      const pollId = c.req.param("id")!;
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = votePollSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.votePoll(pollId, userId, parsed.data.optionIndex);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async createPoll(c: Context) {
    try {
      const societyId = c.get("societyId");
      const body = await c.req.json();
      const parsed = createPollSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.createPoll(societyId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 12. Complaints (GET, POST, PATCH)
  static async getComplaints(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.get("userId");
      const role = c.get("memberRole");
      const isAdmin = role.toLowerCase() === "admin";

      const result = await SocietyService.getComplaints(societyId, userId, isAdmin);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async raiseComplaint(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = raiseComplaintSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.raiseComplaint(societyId, userId, parsed.data);
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async updateComplaint(c: Context) {
    try {
      const complaintId = c.req.param("id")!;
      const body = await c.req.json();
      const parsed = updateComplaintSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.updateComplaint(complaintId, parsed.data.status);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 13. Amenities (GET, POST)
  static async getAmenities(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await SocietyService.getAmenities(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async bookAmenity(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = bookAmenitySchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const dateObj = new Date(parsed.data.date);
      const result = await SocietyService.bookAmenity(userId, {
        amenityId: parsed.data.amenityId,
        date: dateObj,
        timeslot: parsed.data.timeslot,
      });
      return successResponse(c, result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 14. Staff Provider Directory (GET)
  static async getStaff(c: Context) {
    try {
      const societyId = c.get("societyId");
      const result = await SocietyService.getStaff(societyId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 15. Mobile Device Push Tokens (POST)
  static async registerPushToken(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const parsed = registerPushTokenSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Invalid request payload", "VALIDATION_ERROR", 400, parsed.error.format());
      }

      const result = await SocietyService.registerPushToken(userId, parsed.data.token);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // 16. In-app Notification logs (GET, PATCH)
  static async getNotifications(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await SocietyService.getNotifications(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async markNotificationRead(c: Context) {
    try {
      const notificationId = c.req.param("id")!;
      const result = await SocietyService.markNotificationRead(notificationId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  static async getMyFlats(c: Context) {
    try {
      const userId = c.get("userId");
      const result = await SocietyService.getMyFlats(userId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}
