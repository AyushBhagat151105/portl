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

// Notice publication
router.post("/notices", AdminSocietyController.createNotice);

// Poll creation
router.post("/polls", AdminSocietyController.createPoll);

// Support ticket resolution
router.patch("/complaints/:id", AdminSocietyController.updateComplaint);

// Amenities management
router.post("/amenities", AdminSocietyController.createAmenity);

// Staff directory registry CRUD
router.post("/staff", AdminSocietyController.createStaff);
router.delete("/staff/:id", AdminSocietyController.deleteStaff);

// Dues & billing management
router.get("/dues", AdminSocietyController.getDues);
router.post("/dues/generate", AdminSocietyController.generateDues);
router.patch("/dues/:id/mark-paid", AdminSocietyController.markDuePaidOffline);

export default router;
