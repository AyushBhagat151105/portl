import { Hono } from "hono";
import { TreasuryController } from "../../controllers/society/treasury.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";

const router = new Hono();

router.use("/*", authMiddleware);
router.use("/*", roleMiddleware(["admin"]));

// Budgets
router.get("/budgets", TreasuryController.getBudgets);
router.post("/budgets", TreasuryController.createBudget);

// Expenses
router.get("/expenses", TreasuryController.getExpenses);
router.post("/expenses", TreasuryController.createExpense);

// Festivals
router.get("/festivals", TreasuryController.getFestivals);
router.post("/festivals", TreasuryController.createFestival);

export default router;
