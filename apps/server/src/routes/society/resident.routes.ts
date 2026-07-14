import { Hono } from "hono";
import { ResidentSocietyController } from "../../controllers/society/resident.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";

const router = new Hono();

router.use("/*", authMiddleware);
router.use("/*", roleMiddleware(["resident"]));

// Flat information
router.get("/my-flats", ResidentSocietyController.getMyFlats);

// Gate access approvals & pre-approvals
router.get("/visitors/pending", ResidentSocietyController.getPendingGateCalls);
router.patch("/visitors/:id/respond", ResidentSocietyController.respondToVisitor);
router.post("/visitors/pre-approve", ResidentSocietyController.preApproveGuest);

// Amenity bookings
router.post("/amenities/book", ResidentSocietyController.bookAmenity);

// Community voting on polls
router.post("/polls/:id/vote", ResidentSocietyController.votePoll);

export default router;
