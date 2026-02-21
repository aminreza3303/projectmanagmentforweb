import { prisma } from "../db";

const allocatedFromProjects = async () => {
  const aggregate = await prisma.project.aggregate({
    _sum: { budget: true }
  });
  return aggregate._sum.budget || 0;
};

export const getOrCreateGlobalBudget = async () => {
  const existing = await prisma.globalBudget.findFirst();
  if (existing) return existing;
  const allocated = await allocatedFromProjects();
  return prisma.globalBudget.create({ data: { total: allocated, allocated } });
};

export const syncAllocatedWithProjects = async () => {
  const budget = await getOrCreateGlobalBudget();
  const allocated = await allocatedFromProjects();
  if (Math.abs(budget.allocated - allocated) < 0.000001) {
    return budget;
  }
  return prisma.globalBudget.update({
    where: { id: budget.id },
    data: { allocated }
  });
};

export const adjustAllocated = async (_delta: number) => {
  // Allocated is derived from project budgets; keep DB in sync.
  return syncAllocatedWithProjects();
};

export const ensureAvailable = async (amount: number) => {
  const budget = await syncAllocatedWithProjects();
  const available = budget.total - budget.allocated;
  if (amount > available) {
    const error = new Error("Insufficient global budget");
    (error as any).code = "BUDGET_INSUFFICIENT";
    throw error;
  }
  return budget;
};
