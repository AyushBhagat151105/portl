import { Hono } from "hono";
import { GuardSocietyController } from "../../../controllers/society/guard/guard.controller";
import { authMiddleware, roleMiddleware } from "../../../middleware/auth";

const router = new Hono();

router.use("/*", authMiddleware);
router.use("/*", roleMiddleware(["guard", "admin"]));

// Resident lookups & checks
router.get("/search-residents", GuardSocietyController.searchResidents);

// Visitor check-in/checkout flow
router.post("/visitors", GuardSocietyController.registerVisitor);
router.post("/visitors/verify-code", GuardSocietyController.verifyPasscode);
router.patch("/visitors/:id/exit", GuardSocietyController.markVisitorExit);

// Active visitors & history logs
router.get("/visitors/active", GuardSocietyController.getActiveVisitors);
router.get("/visitors/history", GuardSocietyController.getVisitorHistory);

export default router;
