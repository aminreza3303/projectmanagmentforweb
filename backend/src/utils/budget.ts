import { prisma } from "../db";

export const getOrCreateGlobalBudget = async () => {
  const existing = await prisma.globalBudget.findFirst();
  if (existing) return existing;
  const aggregate = await prisma.project.aggregate({
    _sum: { budget: true }
  });
  const allocated = aggregate._sum.budget || 0;
  return prisma.globalBudget.create({ data: { total: allocated, allocated } });
};

export const adjustAllocated = async (delta: number) => {
  const budget = await getOrCreateGlobalBudget();
  if (delta === 0) return budget;
  const nextAllocated = budget.allocated + delta;
  if (nextAllocated < 0) {
    throw new Error("Allocated budget cannot be negative");
  }
  return prisma.globalBudget.update({
    where: { id: budget.id },
    data: { allocated: nextAllocated }
  });
};

export const ensureAvailable = async (amount: number) => {
  const budget = await getOrCreateGlobalBudget();
  const available = budget.total - budget.allocated;
  if (amount > available) {
    const error = new Error("Insufficient global budget");
    (error as any).code = "BUDGET_INSUFFICIENT";
    throw error;
  }
  return budget;
};
