import { Hono } from "hono";
import { CommonSocietyController } from "../../../controllers/society/common/common.controller";
import { NotificationController } from "../../../controllers/society/common/notification.controller";
import { MediaController } from "../../../controllers/society/common/media.controller";
import { authMiddleware, roleMiddleware } from "../../../middleware/auth";

const router = new Hono();

// Auth required for all endpoints
router.use("/*", authMiddleware);

// Onboarding endpoints (does not require role check)
router.get("/my-membership", CommonSocietyController.getMembership);
router.post("/join", CommonSocietyController.joinSociety);

// Common read-only queries (permitted for active members)
router.get("/notices", roleMiddleware(["resident", "guard", "admin"]), CommonSocietyController.getNotices);
router.get("/polls", roleMiddleware(["resident", "admin"]), CommonSocietyController.getPolls);
router.get("/polls/:id/results", roleMiddleware(["resident", "admin"]), CommonSocietyController.getPollResults);
router.get("/complaints", roleMiddleware(["resident", "admin"]), CommonSocietyController.getComplaints);
router.get("/amenities", roleMiddleware(["resident", "admin"]), CommonSocietyController.getAmenities);
router.get("/staff", roleMiddleware(["resident", "guard", "admin"]), CommonSocietyController.getStaff);
router.get("/towers", roleMiddleware(["admin", "resident"]), CommonSocietyController.getTowers);
router.get("/towers/:id/flats", roleMiddleware(["admin"]), CommonSocietyController.getTowerFlats);

// Notification settings & push token endpoints
router.post("/notifications/register-token", roleMiddleware(["resident", "guard", "admin"]), NotificationController.registerPushToken);
router.get("/notifications", roleMiddleware(["resident", "guard", "admin"]), NotificationController.getNotifications);

// Media files endpoints
router.get("/media/signature", roleMiddleware(["resident", "admin"]), MediaController.getUploadSignature);
router.get("/media/aadhar-url", roleMiddleware(["resident", "admin"]), MediaController.getAadharUrl);
router.delete("/media/avatar", roleMiddleware(["resident", "admin"]), MediaController.deleteAvatar);
router.delete("/media/aadhar", roleMiddleware(["resident", "admin"]), MediaController.deleteAadhar);
router.patch("/notifications/:id/read", roleMiddleware(["resident", "guard", "admin"]), NotificationController.markNotificationRead);

export default router;
