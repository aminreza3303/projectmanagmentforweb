import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db";

const app = createApp();
let token = "";
let projectId = 0;
let managerId = 0;

beforeAll(async () => {
  await prisma.$connect();
  await prisma.resource.deleteMany();
  await prisma.report.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const reg = await request(app).post("/api/auth/register").send({
    name: "Manager",
    email: "manager4@example.com",
    password: "123456",
    role: "manager"
  });
  token = reg.body.token;
  managerId = reg.body.user.id;

  const project = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Resources Project",
      manager_id: managerId,
      status: "pending"
    });
  projectId = project.body.id;
});

afterAll(async () => {
  await prisma.resource.deleteMany();
  await prisma.report.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Resources & Reports", () => {
  it("creates a resource", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/resources`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "equipment",
        name: "Laptop",
        amount: 1,
        unit: "pcs"
      });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe("equipment");
  });

  it("lists resources", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/resources`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("creates a report", async () => {
    const res = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project_id: projectId,
        type: "progress",
        content: "Report content"
      });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe("progress");
  });

  it("lists reports", async () => {
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
