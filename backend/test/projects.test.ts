import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db";

const app = createApp();
let token = "";
let managerId = 0;
let projectId = 0;
let memberId = 0;

beforeAll(async () => {
  await prisma.$connect();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const reg = await request(app).post("/api/auth/register").send({
    name: "Manager",
    email: "manager@example.com",
    password: "123456",
    role: "manager"
  });
  token = reg.body.token;
  managerId = reg.body.user.id;

  const member = await request(app).post("/api/auth/register").send({
    name: "Member",
    email: "member@example.com",
    password: "123456",
    role: "member"
  });
  memberId = member.body.user.id;
});

afterAll(async () => {
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Projects", () => {
  it("creates a project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Project",
        manager_id: managerId,
        status: "pending"
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test Project");
    projectId = res.body.id;
  });

  it("lists projects", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("adds and removes project members", async () => {
    const addRes = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: memberId });
    expect(addRes.status).toBe(201);

    const removeRes = await request(app)
      .delete(`/api/projects/${projectId}/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(removeRes.status).toBe(200);
  });
});
