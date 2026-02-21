const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function upsertUser({ name, email, role, password }) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role, password },
    create: { name, email, role, password }
  });
}

async function ensureProject({ title, description, status, priority, budget, managerId }) {
  const existing = await prisma.project.findFirst({ where: { title } });
  if (existing) {
    return prisma.project.update({
      where: { id: existing.id },
      data: { description, status, priority, budget, managerId }
    });
  }

  return prisma.project.create({
    data: {
      title,
      description,
      status,
      priority,
      budget,
      spent: 0,
      managerId
    }
  });
}

async function ensureProjectMember(projectId, userId) {
  return prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: {},
    create: { projectId, userId }
  });
}

async function ensureTask({
  projectId,
  title,
  description,
  status,
  priority,
  cost,
  assigneeId,
  dueDate
}) {
  const existing = await prisma.task.findFirst({ where: { projectId, title } });
  if (existing) {
    return prisma.task.update({
      where: { id: existing.id },
      data: {
        description,
        status,
        priority,
        cost,
        assigneeId,
        dueDate: dueDate || null
      }
    });
  }

  return prisma.task.create({
    data: {
      projectId,
      title,
      description,
      status,
      priority,
      cost,
      assigneeId,
      dueDate
    }
  });
}

async function ensureResource({
  projectId,
  taskId,
  type,
  name,
  amount,
  unit,
  notes
}) {
  const existing = await prisma.resource.findFirst({
    where: { projectId, taskId: taskId || null, name }
  });

  if (existing) {
    return prisma.resource.update({
      where: { id: existing.id },
      data: { type, name, amount, unit, notes }
    });
  }

  return prisma.resource.create({
    data: {
      projectId,
      taskId,
      type,
      name,
      amount,
      unit,
      notes
    }
  });
}

async function syncProjectSpent(projectId) {
  const aggregate = await prisma.task.aggregate({
    where: { projectId },
    _sum: { cost: true }
  });

  return prisma.project.update({
    where: { id: projectId },
    data: { spent: aggregate._sum.cost || 0 }
  });
}

async function main() {
  const password = await bcrypt.hash("12345678", 10);

  const admin = await upsertUser({
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    password
  });

  const amin = await upsertUser({
    name: "Amin",
    email: "amin@example.com",
    role: "manager",
    password
  });

  const amir = await upsertUser({
    name: "Amir",
    email: "amir@example.com",
    role: "member",
    password
  });

  const managers = [];
  for (let i = 1; i <= 5; i += 1) {
    const email = `manager${i}@example.com`;
    const manager = await upsertUser({
      name: `Manager ${i}`,
      email,
      role: "manager",
      password
    });
    managers.push(manager);
  }

  const members = [];
  for (let i = 1; i <= 10; i += 1) {
    const email = `user${i}@example.com`;
    const member = await upsertUser({
      name: `User ${i}`,
      email,
      role: "member",
      password
    });
    members.push(member);
  }

  const project = await ensureProject({
    title: "Sample Project",
    description: "Demo project created by seed",
    status: "pending",
    priority: 1,
    budget: 5000,
    managerId: managers[0].id
  });

  await ensureProjectMember(project.id, members[0].id);

  const task = await ensureTask({
    projectId: project.id,
    title: "Kickoff Task",
    description: "Initial seeded task",
    status: "in_progress",
    priority: 1,
    cost: 1200,
    assigneeId: members[0].id,
    dueDate: addDays(7)
  });

  await syncProjectSpent(project.id);

  const existingLaptopResource = await prisma.resource.findFirst({
    where: { projectId: project.id, taskId: task.id, name: "Laptop" }
  });
  if (!existingLaptopResource) {
    await prisma.resource.create({
      data: {
        projectId: project.id,
        taskId: task.id,
        type: "equipment",
        name: "Laptop",
        amount: 1,
        unit: "pcs"
      }
    });
  }

  const existingReport = await prisma.report.findFirst({
    where: {
      projectId: project.id,
      type: "progress",
      content: "Seeded progress report"
    }
  });
  if (!existingReport) {
    await prisma.report.create({
      data: {
        projectId: project.id,
        type: "progress",
        content: "Seeded progress report",
        createdBy: managers[0].id
      }
    });
  }

  const existingNotification = await prisma.notification.findFirst({
    where: {
      userId: members[0].id,
      title: "Welcome",
      body: "You have been added to Sample Project"
    }
  });
  if (!existingNotification) {
    await prisma.notification.create({
      data: {
        userId: members[0].id,
        title: "Welcome",
        body: "You have been added to Sample Project"
      }
    });
  }

  const backendProject = await ensureProject({
    title: "Backend Implementation Project",
    description: "End-to-end backend implementation and hardening tasks",
    status: "in_progress",
    priority: 1,
    budget: 12000,
    managerId: amin.id
  });

  const frontendProject = await ensureProject({
    title: "Frontend Implementation Project",
    description: "Frontend implementation, responsive UX, and integration",
    status: "in_progress",
    priority: 1,
    budget: 10000,
    managerId: amin.id
  });

  await ensureProjectMember(backendProject.id, amin.id);
  await ensureProjectMember(frontendProject.id, amin.id);
  await ensureProjectMember(frontendProject.id, amir.id);

  const backendTaskArchitecture = await ensureTask({
    projectId: backendProject.id,
    title: "Design backend architecture",
    description: "Finalize modules, routes, and data flows",
    status: "done",
    priority: 1,
    cost: 1200,
    assigneeId: amin.id,
    dueDate: addDays(-10)
  });
  const backendTaskAuth = await ensureTask({
    projectId: backendProject.id,
    title: "Implement auth and RBAC",
    description: "JWT auth and role-based access control",
    status: "done",
    priority: 1,
    cost: 1800,
    assigneeId: amin.id,
    dueDate: addDays(-7)
  });
  const backendTaskApi = await ensureTask({
    projectId: backendProject.id,
    title: "Build project/task APIs",
    description: "CRUD endpoints with validation and activity logs",
    status: "in_progress",
    priority: 1,
    cost: 2200,
    assigneeId: amin.id,
    dueDate: addDays(5)
  });
  const backendTaskHotfix = await ensureTask({
    projectId: backendProject.id,
    title: "Hotfix FK cleanup in tests",
    description: "Stabilize test cleanup order for relational deletes",
    status: "pending",
    priority: 2,
    cost: 900,
    assigneeId: amin.id,
    dueDate: addDays(12)
  });

  const frontendTaskShell = await ensureTask({
    projectId: frontendProject.id,
    title: "Create app shell and router guards",
    description: "Protected routes, public auth views, and app layout",
    status: "done",
    priority: 1,
    cost: 1200,
    assigneeId: amir.id,
    dueDate: addDays(-9)
  });
  const frontendTaskResponsive = await ensureTask({
    projectId: frontendProject.id,
    title: "Implement responsive tables and cards",
    description: "Mobile-friendly data presentation across views",
    status: "in_progress",
    priority: 1,
    cost: 1500,
    assigneeId: amir.id,
    dueDate: addDays(4)
  });
  const frontendTaskTheme = await ensureTask({
    projectId: frontendProject.id,
    title: "Integrate dark/light mode",
    description: "Theme toggle with persisted preference",
    status: "in_progress",
    priority: 2,
    cost: 1300,
    assigneeId: amir.id,
    dueDate: addDays(6)
  });
  const frontendTaskButtons = await ensureTask({
    projectId: frontendProject.id,
    title: "Polish task action buttons on mobile",
    description: "Fix edit/delete button layout and spacing",
    status: "pending",
    priority: 2,
    cost: 800,
    assigneeId: amir.id,
    dueDate: addDays(9)
  });

  await ensureResource({
    projectId: backendProject.id,
    taskId: backendTaskArchitecture.id,
    type: "equipment",
    name: "Server",
    amount: 1,
    unit: "pcs",
    notes: "Architecture and environments"
  });
  await ensureResource({
    projectId: backendProject.id,
    taskId: backendTaskAuth.id,
    type: "equipment",
    name: "Router",
    amount: 2,
    unit: "pcs",
    notes: "Auth and network policies"
  });
  await ensureResource({
    projectId: backendProject.id,
    taskId: backendTaskApi.id,
    type: "equipment",
    name: "Laptop",
    amount: 3,
    unit: "pcs",
    notes: "API implementation pair programming"
  });
  await ensureResource({
    projectId: backendProject.id,
    taskId: backendTaskHotfix.id,
    type: "equipment",
    name: "Monitor",
    amount: 2,
    unit: "pcs",
    notes: "Test debugging"
  });

  await ensureResource({
    projectId: frontendProject.id,
    taskId: frontendTaskShell.id,
    type: "equipment",
    name: "Laptop",
    amount: 2,
    unit: "pcs",
    notes: "Layout and router work"
  });
  await ensureResource({
    projectId: frontendProject.id,
    taskId: frontendTaskResponsive.id,
    type: "equipment",
    name: "Tablet",
    amount: 2,
    unit: "pcs",
    notes: "Responsive QA devices"
  });
  await ensureResource({
    projectId: frontendProject.id,
    taskId: frontendTaskTheme.id,
    type: "equipment",
    name: "Monitor",
    amount: 2,
    unit: "pcs",
    notes: "Theme contrast checks"
  });
  await ensureResource({
    projectId: frontendProject.id,
    taskId: frontendTaskButtons.id,
    type: "equipment",
    name: "Projector",
    amount: 1,
    unit: "pcs",
    notes: "UI review session"
  });

  await syncProjectSpent(backendProject.id);
  await syncProjectSpent(frontendProject.id);

  // Resource catalog (equipment list)
  const catalogItems = [
    { name: "Laptop", type: "equipment", unit: "pcs" },
    { name: "Projector", type: "equipment", unit: "pcs" },
    { name: "Server", type: "equipment", unit: "pcs" },
    { name: "Router", type: "equipment", unit: "pcs" },
    { name: "3D Printer", type: "equipment", unit: "pcs" },
    { name: "Camera", type: "equipment", unit: "pcs" },
    { name: "Microphone", type: "equipment", unit: "pcs" },
    { name: "Monitor", type: "equipment", unit: "pcs" },
    { name: "Scanner", type: "equipment", unit: "pcs" },
    { name: "Tablet", type: "equipment", unit: "pcs" }
  ];

  for (const item of catalogItems) {
    await prisma.resourceItem.upsert({
      where: { name: item.name },
      update: item,
      create: item
    });
  }

  const existingFile = await prisma.file.findFirst({
    where: { projectId: project.id, path: "seed.txt", originalName: "seed.txt" }
  });
  if (!existingFile) {
    await prisma.file.create({
      data: {
        projectId: project.id,
        path: "seed.txt",
        originalName: "seed.txt",
        uploadedBy: managers[0].id
      }
    });
  }

  // Prevent unused vars lint issues
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
