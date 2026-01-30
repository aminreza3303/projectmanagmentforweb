import { Router } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/async-handler";
import { registerSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get(
  "/managers",
  requireAuth,
  requireRole(["admin", "manager"]),
  asyncHandler(async (_req, res) => {
    const managers = await prisma.user.findMany({
      where: { role: "manager" },
      select: { id: true, name: true, email: true }
    });
    return res.json(managers);
  })
);

router.get(
  "/assignable",
  requireAuth,
  requireRole(["admin", "manager"]),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    return res.json(users);
  })
);

router.get(
  "/me/tasks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const tasks = await prisma.task.findMany({
      where: { assigneeId: user.id },
      include: { project: { select: { id: true, title: true } } }
    });
    return res.json(tasks);
  })
);

router.get(
  "/me/resources",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const resources = await prisma.resource.findMany({
      where: { task: { assigneeId: user.id } },
      include: {
        resourceItem: true,
        project: { select: { id: true, title: true } },
        task: { select: { id: true, title: true, dueDate: true, status: true } }
      }
    });
    return res.json(resources);
  })
);

router.use(requireAuth, requireRole(["admin"]));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany();
    return res.json(users.map((u) => ({ ...u, password: undefined })));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ ...user, password: undefined });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password,
        role: data.role || "member"
      }
    });
    return res.status(201).json({ ...user, password: undefined });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const update = registerSchema.partial().parse(req.body);
    if (update.email) update.email = update.email.toLowerCase();
    if (update.password) update.password = await bcrypt.hash(update.password, 10);

    const user = await prisma.user.update({
      where: { id },
      data: update
    });

    return res.json({ ...user, password: undefined });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  })
);

export default router;
