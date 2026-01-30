import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db";

const app = createApp();

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Auth", () => {
  it("registers a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "test@example.com",
      password: "123456",
      role: "admin"
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });

  it("logs in a user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "123456"
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
});
