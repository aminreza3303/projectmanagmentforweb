const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function getOrCreateUser(role, email, name) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const password = await bcrypt.hash("123456", 10);
  return prisma.user.create({
    data: {
      name,
      email,
      password,
      role
    }
  });
}

async function main() {
  const manager =
    (await prisma.user.findFirst({ where: { role: "manager" } })) ||
    (await getOrCreateUser("manager", "manager.demo@example.com", "Manager Demo"));

  const member =
    (await prisma.user.findFirst({ where: { role: "member" } })) ||
    (await getOrCreateUser("member", "member.demo@example.com", "Member Demo"));

  let globalBudget = await prisma.globalBudget.findFirst();
  if (!globalBudget) {
    globalBudget = await prisma.globalBudget.create({ data: { total: 0, allocated: 0 } });
  }

  if (globalBudget.total < 10000) {
    globalBudget = await prisma.globalBudget.update({
      where: { id: globalBudget.id },
      data: { total: 10000 }
    });
  }

  let project = await prisma.project.findFirst({
    where: { title: "Finance Demo Project" }
  });

  if (!project) {
    const budgetAmount = 3000;
    const available = globalBudget.total - globalBudget.allocated;
    if (available < budgetAmount) {
      globalBudget = await prisma.globalBudget.update({
        where: { id: globalBudget.id },
        data: { total: globalBudget.total + (budgetAmount - available) }
      });
    }
    project = await prisma.project.create({
      data: {
        title: "Finance Demo Project",
        description: "Sample project with financial and non-financial resources",
        status: "pending",
        priority: 1,
        budget: budgetAmount,
        spent: 0,
        managerId: manager.id
      }
    });
    await prisma.globalBudget.update({
      where: { id: globalBudget.id },
      data: { allocated: globalBudget.allocated + budgetAmount }
    });
  }

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member.id } },
    update: {},
    create: { projectId: project.id, userId: member.id }
  });

  let task = await prisma.task.findFirst({
    where: { projectId: project.id, title: "Sample Cost Task" }
  });

  if (!task) {
    const cost = 400;
    if (project.budget < project.spent + cost) {
      const delta = project.spent + cost - project.budget;
      project = await prisma.project.update({
        where: { id: project.id },
        data: { budget: project.budget + delta }
      });
      await prisma.globalBudget.update({
        where: { id: globalBudget.id },
        data: { allocated: globalBudget.allocated + delta }
      });
    }

    task = await prisma.task.create({
      data: {
        projectId: project.id,
        title: "Sample Cost Task",
        description: "Task with cost to spend project budget",
        status: "in_progress",
        priority: 1,
        cost,
        assigneeId: member.id
      }
    });

    project = await prisma.project.update({
      where: { id: project.id },
      data: { spent: { increment: cost } }
    });
  }

  const catalogItems = [
    { name: "Laptop", type: "equipment", unit: "pcs" },
    { name: "Router", type: "equipment", unit: "pcs" },
    { name: "Office Hours", type: "service", unit: "hours" }
  ];

  for (const item of catalogItems) {
    await prisma.resourceItem.upsert({
      where: { name: item.name },
      update: item,
      create: item
    });
  }

  const laptop = await prisma.resourceItem.findUnique({ where: { name: "Laptop" } });
  const router = await prisma.resourceItem.findUnique({ where: { name: "Router" } });

  const existingProjectResource = await prisma.resource.findFirst({
    where: { projectId: project.id, resourceItemId: laptop?.id, taskId: null }
  });
  if (!existingProjectResource && laptop) {
    await prisma.resource.create({
      data: {
        projectId: project.id,
        resourceItemId: laptop.id,
        type: laptop.type,
        name: laptop.name,
        unit: laptop.unit || undefined,
        amount: 2
      }
    });
  }

  const existingTaskResource = await prisma.resource.findFirst({
    where: { projectId: project.id, resourceItemId: router?.id, taskId: task.id }
  });
  if (!existingTaskResource && router) {
    await prisma.resource.create({
      data: {
        projectId: project.id,
        taskId: task.id,
        resourceItemId: router.id,
        type: router.type,
        name: router.name,
        unit: router.unit || undefined,
        amount: 1
      }
    });
  }

  console.log("Sample allocations created:");
  console.log(`- Global budget total: ${globalBudget.total}`);
  console.log(`- Project: ${project.title} (budget ${project.budget}, spent ${project.spent})`);
  console.log(`- Task: ${task.title} (cost ${task.cost})`);
  console.log("- Resources: Laptop x2 (project), Router x1 (task)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
