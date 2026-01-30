import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { projectSchema, projectUpdateSchema, statusSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    const { status, priority, q } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = Number(priority);
    if (q) where.title = { contains: String(q), mode: "insensitive" };

    if (user.role !== "admin") {
      where.OR = [
        { managerId: user.id },
        { members: { some: { userId: user.id } } }
      ];
    }

    const projects = await prisma.project.findMany({ where });
    return res.json(projects);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin") {
      const isManager = project.managerId === user.id;
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: id, userId: user.id }
      });
      if (!isManager && !isMember) return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(project);
  })
);

router.get(
  "/:id/members",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin") {
      const isManager = project.managerId === user.id;
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId, userId: user.id }
      });
      if (!isManager && !isMember) return res.status(403).json({ message: "Forbidden" });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });
    return res.json(members.map((m) => m.user));
  })
);

router.get(
  "/:id/files",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin") {
      const isManager = project.managerId === user.id;
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId, userId: user.id }
      });
      if (!isManager && !isMember) return res.status(403).json({ message: "Forbidden" });
    }

    const files = await prisma.file.findMany({
      where: { projectId },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } }
      }
    });
    return res.json(files);
  })
);

router.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = projectSchema.parse(req.body);
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid project dates" });
      }
      if (start > end) {
        return res.status(400).json({ message: "Project start date must be before end date" });
      }
    }
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        status: data.status || "pending",
        priority: data.priority ?? 0,
        budget: data.budget ?? 0,
        spent: 0,
        managerId: data.manager_id
      }
    });

    if (data.resources && data.resources.length > 0) {
      const ids = data.resources.map((r) => r.resourceItemId);
      const items = await prisma.resourceItem.findMany({ where: { id: { in: ids } } });
      if (items.length !== ids.length) {
        return res.status(400).json({ message: "Invalid resource selection" });
      }

      const itemMap = new Map(items.map((i) => [i.id, i]));
      const resourcesData = data.resources.map((r) => {
        const item = itemMap.get(r.resourceItemId)!;
        return {
          projectId: project.id,
          resourceItemId: item.id,
          type: item.type,
          name: item.name,
          unit: item.unit || undefined,
          amount: r.amount
        };
      });

      await prisma.resource.createMany({ data: resourcesData });
    }

    return res.status(201).json(project);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = projectUpdateSchema.parse(req.body);
    const nextStart = data.start_date ? new Date(data.start_date) : project.startDate;
    const nextEnd = data.end_date ? new Date(data.end_date) : project.endDate;
    if (nextStart && Number.isNaN(nextStart.getTime())) {
      return res.status(400).json({ message: "Invalid project start date" });
    }
    if (nextEnd && Number.isNaN(nextEnd.getTime())) {
      return res.status(400).json({ message: "Invalid project end date" });
    }
    if (nextStart && nextEnd && nextStart > nextEnd) {
      return res.status(400).json({ message: "Project start date must be before end date" });
    }
    if (nextStart || nextEnd) {
      const outOfRange = await prisma.task.findFirst({
        where: {
          projectId: id,
          dueDate: {
            not: null,
            ...(nextStart ? { lt: nextStart } : {}),
            ...(nextEnd ? { gt: nextEnd } : {})
          }
        }
      });
      if (outOfRange) {
        return res.status(400).json({
          message: "Project date range conflicts with existing task due dates"
        });
      }
    }
    if (data.budget !== undefined && data.budget < project.spent) {
      return res.status(400).json({ message: "Budget cannot be less than spent" });
    }
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        status: data.status,
        priority: data.priority,
        budget: data.budget,
        managerId: data.manager_id
      }
    });
    return res.json(updated);
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin") {
      const isManager = project.managerId === user.id;
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: id, userId: user.id }
      });
      if (!isManager && !isMember) return res.status(403).json({ message: "Forbidden" });
    }

    const data = statusSchema.parse(req.body);
    const updated = await prisma.project.update({
      where: { id },
      data: { status: data.status }
    });
    return res.json(updated);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.project.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  })
);

router.post(
  "/:id/members",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const { userId } = req.body as { userId: number };

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const member = await prisma.projectMember.create({
        data: { projectId, userId }
      });
      return res.status(201).json(member);
    } catch {
      return res.status(409).json({ message: "Member already added" });
    }
  })
);

router.delete(
  "/:id/members/:userId",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const userId = Number(req.params.userId);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.projectMember.deleteMany({ where: { projectId, userId } });
    return res.json({ message: "Removed" });
  })
);

export default router;
