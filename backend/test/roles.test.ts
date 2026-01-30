import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db";

const app = createApp();

const cleanDb = async () => {
  await prisma.file.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
};

describe("Roles & Access", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await cleanDb();
  });

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  });

  it("member cannot create project", async () => {
    const manager = await request(app).post("/api/auth/register").send({
      name: "Manager",
      email: "manager3@example.com",
      password: "123456",
      role: "manager"
    });
    const managerId = manager.body.user.id;

    const member = await request(app).post("/api/auth/register").send({
      name: "Member",
      email: "member3@example.com",
      password: "123456",
      role: "member"
    });

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${member.body.token}`)
      .send({
        title: "No Access",
        manager_id: managerId,
        status: "pending"
      });

    expect(res.status).toBe(403);
  });

  it("admin can list users", async () => {
    const admin = await request(app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin3@example.com",
      password: "123456",
      role: "admin"
    });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
