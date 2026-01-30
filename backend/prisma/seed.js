const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password,
      role: "admin",
      name: "Admin"
    },
    create: {
      name: "Admin",
      email: "admin@example.com",
      password,
      role: "admin"
    }
  });

  const managers = [];
  for (let i = 1; i <= 5; i += 1) {
    const email = `manager${i}@example.com`;
    const manager = await prisma.user.upsert({
      where: { email },
      update: {
        password,
        role: "manager",
        name: `Manager ${i}`
      },
      create: {
        name: `Manager ${i}`,
        email,
        password,
        role: "manager"
      }
    });
    managers.push(manager);
  }

  const members = [];
  for (let i = 1; i <= 10; i += 1) {
    const email = `user${i}@example.com`;
    const member = await prisma.user.upsert({
      where: { email },
      update: {
        password,
        role: "member",
        name: `User ${i}`
      },
      create: {
        name: `User ${i}`,
        email,
        password,
        role: "member"
      }
    });
    members.push(member);
  }

  const project = await prisma.project.create({
    data: {
      title: "Sample Project",
      description: "Demo project created by seed",
      status: "pending",
      priority: 1,
      budget: 5000,
      spent: 0,
      managerId: managers[0].id
    }
  });

  await prisma.projectMember.create({
    data: { projectId: project.id, userId: members[0].id }
  });

  const task = await prisma.task.create({
    data: {
      projectId: project.id,
      title: "Kickoff Task",
      status: "in_progress",
      priority: 1,
      cost: 1200,
      assigneeId: members[0].id
    }
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { spent: { increment: 1200 } }
  });

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

  await prisma.report.create({
    data: {
      projectId: project.id,
      type: "progress",
      content: "Seeded progress report",
      createdBy: managers[0].id
    }
  });

  await prisma.notification.create({
    data: {
      userId: members[0].id,
      title: "Welcome",
      body: "You have been added to Sample Project"
    }
  });

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

  await prisma.file.create({
    data: {
      projectId: project.id,
      path: "seed.txt",
      originalName: "seed.txt",
      uploadedBy: managers[0].id
    }
  });

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
