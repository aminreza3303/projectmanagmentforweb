import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db";

const app = createApp();
let token = "";
let projectId = 0;
let managerId = 0;

beforeAll(async () => {
  await prisma.$connect();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const reg = await request(app).post("/api/auth/register").send({
    name: "Manager2",
    email: "manager2@example.com",
    password: "123456",
    role: "manager"
  });
  token = reg.body.token;
  managerId = reg.body.user.id;

  const project = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Task Project",
      manager_id: managerId,
      status: "pending"
    });
  projectId = project.body.id;
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Tasks", () => {
  it("creates a task", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task 1",
        assignee_id: managerId,
        status: "pending"
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Task 1");
  });

  it("updates a task", async () => {
    const list = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`);
    const taskId = list.body[0].id;

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 1 Updated" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Task 1 Updated");
  });

  it("updates task status", async () => {
    const list = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`);
    const taskId = list.body[0].id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
  });

  it("filters tasks by status", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?status=done`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.every((t: any) => t.status === "done")).toBe(true);
  });

  it("deletes a task", async () => {
    const list = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`);
    const taskId = list.body[0].id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
