import { Hono } from "hono";
import { authMiddleware, roleMiddleware } from "../../../middleware/auth";
import { AdminSetupController } from "../../../controllers/society/admin/admin-setup.controller";
import { AdminResidentController } from "../../../controllers/society/admin/admin-resident.controller";
import { AdminNoticeController } from "../../../controllers/society/admin/admin-notice.controller";
import { AdminCommunityController } from "../../../controllers/society/admin/admin-community.controller";
import { AdminStaffController } from "../../../controllers/society/admin/admin-staff.controller";
import { AdminBillingController } from "../../../controllers/society/admin/admin-billing.controller";

const router = new Hono();

router.use("/*", authMiddleware);
router.use("/*", roleMiddleware(["admin"]));

// Setup, members & structure management
router.post("/setup", AdminSetupController.setupSociety);
router.get("/members", AdminResidentController.getMembers);
router.patch("/residents/assign-flat", AdminSetupController.assignFlat);

// Resident Detailed CRUD
router.post("/residents", AdminResidentController.createResident);
router.put("/residents/:id", AdminResidentController.updateResident);
router.delete("/residents/:id", AdminResidentController.deleteResident);
router.get("/residents/:id/aadhar-url", AdminResidentController.getResidentAadharUrl);

// Flat Allocation
router.put("/flats/allocate", AdminSetupController.allocateFlat);

// Notice publication and removal
router.post("/notices", AdminNoticeController.createNotice);
router.delete("/notices/:id", AdminNoticeController.deleteNotice);

// Poll creation
router.post("/polls", AdminCommunityController.createPoll);
router.patch("/polls/:id/close", AdminCommunityController.closePoll);

// Support ticket resolution
router.patch("/complaints/:id", AdminCommunityController.updateComplaint);

// Amenities management
router.post("/amenities", AdminCommunityController.createAmenity);

// Staff directory registry CRUD
router.post("/staff", AdminStaffController.createStaff);
router.put("/staff/:id", AdminStaffController.updateStaff);
router.delete("/staff/:id", AdminStaffController.deleteStaff);
router.get("/staff/:id/aadhar-url", AdminStaffController.getStaffAadharUrl);
router.delete("/staff/:id/avatar", AdminStaffController.deleteStaffAvatar);
router.delete("/staff/:id/aadhar", AdminStaffController.deleteStaffAadhar);

// Dues & billing management
router.get("/dues", AdminBillingController.getDues);
router.post("/dues/generate", AdminBillingController.generateDues);
router.patch("/dues/:id/mark-paid", AdminBillingController.markDuePaidOffline);

// Payment configuration
router.get("/payment/config", AdminBillingController.getPaymentConfig);
router.put("/payment/config", AdminBillingController.updatePaymentConfig);

// Amenity Booking requests
router.get("/bookings", AdminCommunityController.getBookingRequests);
router.patch("/bookings/:id/respond", AdminCommunityController.respondToBookingRequest);

export default router;
