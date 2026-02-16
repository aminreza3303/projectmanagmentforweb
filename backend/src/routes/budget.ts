import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { prisma } from "../db";
import { budgetIncreaseSchema } from "../utils/validators";
import { getOrCreateGlobalBudget } from "../utils/budget";
import { safeLogActivity } from "../utils/activity";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req: AuthedRequest, res) => {
    const budget = await getOrCreateGlobalBudget();
    const available = budget.total - budget.allocated;
    return res.json({
      id: budget.id,
      total: budget.total,
      allocated: budget.allocated,
      available
    });
  })
);

router.post(
  "/increase",
  requireRole(["admin"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = budgetIncreaseSchema.parse(req.body);
    const budget = await getOrCreateGlobalBudget();
    const updated = await prisma.globalBudget.update({
      where: { id: budget.id },
      data: { total: budget.total + data.amount }
    });
    safeLogActivity({
      actorId: req.user?.id,
      action: "budget.increased",
      message: `Global budget increased by ${data.amount}`,
      metadata: { amount: data.amount }
    });
    return res.json({
      id: updated.id,
      total: updated.total,
      allocated: updated.allocated,
      available: updated.total - updated.allocated
    });
  })
);

export default router;
