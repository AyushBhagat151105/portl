import { Hono } from "hono";
import { SocietyController } from "../controllers/society.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = new Hono();

// All routes require authentication
router.use("/*", authMiddleware);

// ── Onboarding (no role required — user may not have joined yet) ──────────────
router.get("/my-membership", SocietyController.getMembership);
router.post("/join", SocietyController.joinSociety);

// ── Admin-only society setup ───────────────────────────────────────────────────
router.post("/setup", roleMiddleware(["admin"]), SocietyController.setupSociety);

// ── Gate Visitor Management (Guard) ───────────────────────────────────────────
router.post("/visitors", roleMiddleware(["guard"]), SocietyController.registerVisitor);
router.post("/visitors/verify-code", roleMiddleware(["guard"]), SocietyController.verifyPasscode);
router.patch("/visitors/:id/exit", roleMiddleware(["guard"]), SocietyController.markVisitorExit);

// ── Visitor Logs ───────────────────────────────────────────────────────────────
router.get("/visitors/active", roleMiddleware(["guard", "admin"]), SocietyController.getActiveVisitors);
router.get("/visitors/history", roleMiddleware(["guard", "admin"]), SocietyController.getVisitorHistory);
router.get("/search-residents", roleMiddleware(["guard", "admin"]), SocietyController.searchResidents);

// ── Resident Visitor Management ────────────────────────────────────────────────
router.get("/my-flats", roleMiddleware(["resident"]), SocietyController.getMyFlats);
router.get("/visitors/pending", roleMiddleware(["resident"]), SocietyController.getPendingGateCalls);
router.patch("/visitors/:id/respond", roleMiddleware(["resident"]), SocietyController.respondToVisitor);
router.post("/visitors/pre-approve", roleMiddleware(["resident"]), SocietyController.preApproveGuest);

// ── Notice Board ──────────────────────────────────────────────────────────────
router.get("/notices", roleMiddleware(["resident", "guard", "admin"]), SocietyController.getNotices);
router.post("/notices", roleMiddleware(["admin"]), SocietyController.createNotice);

// ── Community Polls ───────────────────────────────────────────────────────────
router.get("/polls", roleMiddleware(["resident", "admin"]), SocietyController.getPolls);
router.post("/polls/:id/vote", roleMiddleware(["resident"]), SocietyController.votePoll);
router.post("/polls", roleMiddleware(["admin"]), SocietyController.createPoll);

// ── Helpdesk Complaints ───────────────────────────────────────────────────────
router.get("/complaints", roleMiddleware(["resident", "admin"]), SocietyController.getComplaints);
router.post("/complaints", roleMiddleware(["resident"]), SocietyController.raiseComplaint);
router.patch("/complaints/:id", roleMiddleware(["admin"]), SocietyController.updateComplaint);

// ── Amenities ─────────────────────────────────────────────────────────────────
router.get("/amenities", roleMiddleware(["resident", "admin"]), SocietyController.getAmenities);
router.post("/amenities", roleMiddleware(["admin"]), SocietyController.createAmenity);
router.post("/amenities/book", roleMiddleware(["resident"]), SocietyController.bookAmenity);

// ── Society Staff Directory ───────────────────────────────────────────────────
router.get("/staff", roleMiddleware(["resident", "guard", "admin"]), SocietyController.getStaff);
router.post("/staff", roleMiddleware(["admin"]), SocietyController.createStaff);
router.delete("/staff/:id", roleMiddleware(["admin"]), SocietyController.deleteStaff);

// ── Members & Flat Assignment (Admin) ─────────────────────────────────────────
router.get("/members", roleMiddleware(["admin"]), SocietyController.getMembers);
router.get("/towers", roleMiddleware(["admin", "resident"]), SocietyController.getTowers);
router.patch("/residents/assign-flat", roleMiddleware(["admin"]), SocietyController.assignFlat);

// ── Device Push Tokens ─────────────────────────────────────────────────────────
router.post("/notifications/register-token", roleMiddleware(["resident", "guard", "admin"]), SocietyController.registerPushToken);

// ── In-app Notifications ──────────────────────────────────────────────────────
router.get("/notifications", roleMiddleware(["resident", "guard", "admin"]), SocietyController.getNotifications);
router.patch("/notifications/:id/read", roleMiddleware(["resident", "guard", "admin"]), SocietyController.markNotificationRead);

export default router;
