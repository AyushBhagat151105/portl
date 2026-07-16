import { Hono } from "hono";
import { AdminSocietyController } from "../../controllers/society/admin.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";

const router = new Hono();

router.use("/*", authMiddleware);
router.use("/*", roleMiddleware(["admin"]));

// Setup, members & structure management
router.post("/setup", AdminSocietyController.setupSociety);
router.get("/members", AdminSocietyController.getMembers);
router.patch("/residents/assign-flat", AdminSocietyController.assignFlat);

// Resident Detailed CRUD
router.post("/residents", AdminSocietyController.createResident);
router.put("/residents/:id", AdminSocietyController.updateResident);
router.delete("/residents/:id", AdminSocietyController.deleteResident);

// Flat Allocation
router.put("/flats/allocate", AdminSocietyController.allocateFlat);

// Notice publication
router.post("/notices", AdminSocietyController.createNotice);

// Poll creation
router.post("/polls", AdminSocietyController.createPoll);
router.patch("/polls/:id/close", AdminSocietyController.closePoll);

// Support ticket resolution
router.patch("/complaints/:id", AdminSocietyController.updateComplaint);

// Amenities management
router.post("/amenities", AdminSocietyController.createAmenity);

// Staff directory registry CRUD
router.post("/staff", AdminSocietyController.createStaff);
router.put("/staff/:id", AdminSocietyController.updateStaff);
router.delete("/staff/:id", AdminSocietyController.deleteStaff);

// Dues & billing management
router.get("/dues", AdminSocietyController.getDues);
router.post("/dues/generate", AdminSocietyController.generateDues);
router.patch("/dues/:id/mark-paid", AdminSocietyController.markDuePaidOffline);

// Payment configuration
router.get("/payment/config", AdminSocietyController.getPaymentConfig);
router.put("/payment/config", AdminSocietyController.updatePaymentConfig);

// Amenity Booking requests
router.get("/bookings", AdminSocietyController.getBookingRequests);
router.patch("/bookings/:id/respond", AdminSocietyController.respondToBookingRequest);

export default router;
