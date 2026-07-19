import { Hono } from "hono";
import { ResidentSocietyController } from "../../../controllers/society/resident/resident.controller";
import { ResidentPaymentController } from "../../../controllers/society/resident/resident-payment.controller";
import { ResidentVehicleController } from "../../../controllers/society/resident/resident-vehicle.controller";
import { authMiddleware, roleMiddleware } from "../../../middleware/auth";

const router = new Hono();

router.use("/*", authMiddleware);
router.use("/*", roleMiddleware(["resident"]));

// Flat information
router.get("/my-flats", ResidentSocietyController.getMyFlats);

// Profile Management
router.get("/profile", ResidentSocietyController.getMyProfile);
router.put("/profile", ResidentSocietyController.updateMyProfile);

// Vehicle Parking alert system
router.get("/vehicles/search", ResidentVehicleController.searchVehicle);
router.post("/vehicles/:id/notify-blocking", ResidentVehicleController.notifyVehicleBlocking);

// Gate access approvals & pre-approvals
router.get("/visitors/pending", ResidentSocietyController.getPendingGateCalls);
router.patch("/visitors/:id/respond", ResidentSocietyController.respondToVisitor);
router.post("/visitors/pre-approve", ResidentSocietyController.preApproveGuest);

// Helpdesk complaints
router.post("/complaints", ResidentSocietyController.createComplaint);

// Amenity bookings
router.post("/amenities/book", ResidentSocietyController.bookAmenity);

// Community voting on polls
router.post("/polls/:id/vote", ResidentSocietyController.votePoll);

// Maintenance dues & Razorpay payments
router.get("/dues", ResidentPaymentController.getMyDues);
router.post("/dues/:id/order", ResidentPaymentController.createRazorpayOrder);
router.post("/dues/:id/verify-payment", ResidentPaymentController.verifyPayment);

export default router;
