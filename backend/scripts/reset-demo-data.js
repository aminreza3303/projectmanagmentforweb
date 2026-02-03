/* Reset database with multiple demo projects in varied statuses.
   Run: node scripts/reset-demo-data.js
*/
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const projectSeeds = [
  {
    title: "Completed Demo Project",
    description: "Delivered end-to-end; all tasks done and resources freed",
    start: "2026-01-01",
    end: "2026-02-15",
    status: "done",
    budget: 20000,
    managerEmail: "manager@example.com",
    tasks: [
      { title: "Discovery & Planning", due: "2026-01-05", assigneeEmail: "member@example.com", cost: 2000, priority: 1, status: "done" },
      { title: "Design Sprint", due: "2026-01-12", assigneeEmail: "user1@example.com", cost: 2500, priority: 2, status: "done" },
      { title: "API Implementation", due: "2026-01-25", assigneeEmail: "user2@example.com", cost: 4000, priority: 3, status: "done" },
      { title: "Frontend Build", due: "2026-02-05", assigneeEmail: "user3@example.com", cost: 3500, priority: 2, status: "done" },
      { title: "QA & UAT", due: "2026-02-10", assigneeEmail: "member@example.com", cost: 2000, priority: 1, status: "done" },
      { title: "Launch & Training", due: "2026-02-12", assigneeEmail: "user1@example.com", cost: 1500, priority: 1, status: "done" }
    ],
    resources: [
      { resourceItemId: 1, amount: 5, taskTitle: "Frontend Build" },
      { resourceItemId: 3, amount: 1, taskTitle: "API Implementation" },
      { resourceItemId: 4, amount: 2, taskTitle: "API Implementation" },
      { resourceItemId: 8, amount: 4, taskTitle: "Design Sprint" },
      { resourceItemId: 7, amount: 2, taskTitle: "Launch & Training" }
    ],
    report: "Project delivered 100% with all milestones completed on time."
  },
  {
    title: "Payment Platform Revamp",
    description: "In progress with mixed task states",
    start: "2026-02-01",
    end: "2026-03-30",
    status: "in_progress",
    budget: 30000,
    managerEmail: "manager1@example.com",
    tasks: [
      { title: "Requirements Freeze", due: "2026-02-05", assigneeEmail: "user2@example.com", cost: 1000, priority: 1, status: "done" },
      { title: "Core API Upgrade", due: "2026-02-20", assigneeEmail: "user3@example.com", cost: 5000, priority: 2, status: "in_progress" },
      { title: "PCI Compliance Prep", due: "2026-02-25", assigneeEmail: "member@example.com", cost: 3000, priority: 2, status: "pending" },
      { title: "Load Testing", due: "2026-03-10", assigneeEmail: "user1@example.com", cost: 4000, priority: 3, status: "todo" },
      { title: "Pilot Launch", due: "2026-03-20", assigneeEmail: "user4@example.com", cost: 3500, priority: 2, status: "todo" }
    ],
    resources: [
      { resourceItemId: 3, amount: 2, taskTitle: "Core API Upgrade" }, // Server
      { resourceItemId: 4, amount: 3, taskTitle: "Core API Upgrade" }, // Router
      { resourceItemId: 8, amount: 2, taskTitle: "Load Testing" } // Monitor
    ],
    report: "Phase 1 complete; API upgrade in progress; compliance tasks queued."
  },
  {
    title: "Mobile App Redesign",
    description: "Early phase pending tasks",
    start: "2026-02-05",
    end: "2026-04-05",
    status: "pending",
    budget: 18000,
    managerEmail: "manager2@example.com",
    tasks: [
      { title: "User Research", due: "2026-02-15", assigneeEmail: "user5@example.com", cost: 1200, priority: 1, status: "pending" },
      { title: "Design System Setup", due: "2026-02-28", assigneeEmail: "user6@example.com", cost: 1800, priority: 2, status: "todo" },
      { title: "Navigation Prototype", due: "2026-03-05", assigneeEmail: "user7@example.com", cost: 1500, priority: 2, status: "todo" }
    ],
    resources: [
      { resourceItemId: 10, amount: 3, taskTitle: "Design System Setup" }, // Tablet
      { resourceItemId: 8, amount: 2, taskTitle: "Design System Setup" } // Monitor
    ],
    report: "Awaiting research completion; design system scheduled next."
  },
  {
    title: "Data Warehouse Migration",
    description: "On hold awaiting vendor approval",
    start: "2026-01-20",
    end: "2026-03-10",
    status: "on_hold",
    budget: 25000,
    managerEmail: "manager3@example.com",
    tasks: [
      { title: "Schema Audit", due: "2026-01-30", assigneeEmail: "user8@example.com", cost: 2000, priority: 1, status: "done" },
      { title: "ETL Pipeline PoC", due: "2026-02-10", assigneeEmail: "user9@example.com", cost: 3500, priority: 2, status: "in_progress" },
      { title: "Vendor Security Review", due: "2026-02-18", assigneeEmail: "user10@example.com", cost: 1500, priority: 2, status: "pending" },
      { title: "Cutover Plan", due: "2026-02-28", assigneeEmail: "member@example.com", cost: 1000, priority: 1, status: "todo" }
    ],
    resources: [
      { resourceItemId: 3, amount: 1, taskTitle: "ETL Pipeline PoC" },
      { resourceItemId: 4, amount: 2, taskTitle: "ETL Pipeline PoC" },
      { resourceItemId: 1, amount: 2, taskTitle: "Cutover Plan" }
    ],
    report: "Project paused pending vendor sign-off; PoC partially completed."
  }
];

async function main() {
  await prisma.file.deleteMany();
  await prisma.report.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();

  const allUsers = await prisma.user.findMany();
  const userByEmail = new Map(allUsers.map((u) => [u.email, u]));

  for (const seed of projectSeeds) {
    const manager = userByEmail.get(seed.managerEmail);
    if (!manager) throw new Error(`Manager ${seed.managerEmail} not found. Seed users first.`);
    const project = await prisma.project.create({
      data: {
        title: seed.title,
        description: seed.description,
        startDate: new Date(seed.start),
        endDate: new Date(seed.end),
        status: seed.status,
        priority: 1,
        budget: seed.budget,
        spent: 0,
        managerId: manager.id
      }
    });

    const memberEmails = Array.from(
      new Set([seed.managerEmail, ...seed.tasks.map((t) => t.assigneeEmail)])
    );
    const members = memberEmails.map((email) => {
      const user = userByEmail.get(email);
      if (!user) throw new Error(`User ${email} not found. Seed users first.`);
      return user;
    });
    await prisma.projectMember.createMany({
      data: members.map((m) => ({ projectId: project.id, userId: m.id }))
    });

    let spent = 0;
    const tasks = [];
    for (const t of seed.tasks) {
      const assignee = userByEmail.get(t.assigneeEmail);
      const task = await prisma.task.create({
        data: {
          projectId: project.id,
          title: t.title,
          dueDate: new Date(t.due),
          status: t.status,
          priority: t.priority,
          cost: t.cost,
          assigneeId: assignee.id
        }
      });
      tasks.push(task);
      spent += t.cost;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: { spent }
    });

    const taskByTitle = new Map(tasks.map((t) => [t.title, t]));
    for (const r of seed.resources) {
      const task = taskByTitle.get(r.taskTitle);
      await prisma.resource.create({
        data: {
          projectId: project.id,
          taskId: task?.id,
          resourceItemId: r.resourceItemId,
          amount: r.amount
        }
      });
    }

    if (seed.report) {
      await prisma.report.create({
        data: {
          projectId: project.id,
          type: "progress",
          content: seed.report,
          createdBy: manager.id
        }
      });
    }
  }

  console.log(`Reset complete. Projects created: ${projectSeeds.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
