import { Hono } from "hono";
import { TreasuryController } from "../../../controllers/society/treasury/treasury.controller";
import { FixedDepositController } from "../../../controllers/society/treasury/fd.controller";
import { authMiddleware, roleMiddleware } from "../../../middleware/auth";

const router = new Hono();

router.use("/*", authMiddleware);

// Budgets — Read (Admin, Resident), Write (Admin only)
router.get("/budgets", roleMiddleware(["admin", "resident", "owner"]), TreasuryController.getBudgets);
router.post("/budgets", roleMiddleware(["admin", "owner"]), TreasuryController.createBudget);

// Expenses — Read (Admin, Resident), Write (Admin only)
router.get("/expenses", roleMiddleware(["admin", "resident", "owner"]), TreasuryController.getExpenses);
router.post("/expenses", roleMiddleware(["admin", "owner"]), TreasuryController.createExpense);

// Festivals — Read (Admin, Resident), Write (Admin only)
router.get("/festivals", roleMiddleware(["admin", "resident", "owner"]), TreasuryController.getFestivals);
router.post("/festivals", roleMiddleware(["admin", "owner"]), TreasuryController.createFestival);

// Fixed Deposits — Read (Admin, Resident), Write (Admin only)
router.get("/fds", roleMiddleware(["admin", "resident", "owner"]), FixedDepositController.getFixedDeposits);
router.post("/fds", roleMiddleware(["admin", "owner"]), FixedDepositController.createFixedDeposit);
router.delete("/fds/:id", roleMiddleware(["admin", "owner"]), FixedDepositController.deleteFixedDeposit);

// Block Summaries Report — Read (Admin, Resident)
router.get("/reports/blocks", roleMiddleware(["admin", "resident", "owner"]), TreasuryController.getBlockCollectionSummaries);

export default router;
