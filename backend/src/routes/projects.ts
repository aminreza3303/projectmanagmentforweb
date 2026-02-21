import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { projectSchema, projectUpdateSchema, statusSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { safeLogActivity } from "../utils/activity";
import { notifyUsers } from "../utils/notify";
import { adjustAllocated, ensureAvailable } from "../utils/budget";

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

router.get(
  "/:id/activity",
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

    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const take = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 50;
    const activities = await prisma.activity.findMany({
      where: { projectId },
      include: {
        actor: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" },
      take
    });

    return res.json(activities);
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
    const budget = data.budget ?? 0;
    if (budget > 0 && user.role !== "manager") {
      return res.status(403).json({ message: "Only managers can allocate project budgets" });
    }
    if (budget > 0) {
      try {
        await ensureAvailable(budget);
      } catch {
        return res.status(400).json({ message: "Insufficient global budget" });
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
        budget,
        spent: 0,
        managerId: data.manager_id
      }
    });

    if (budget > 0) {
      await adjustAllocated(budget);
    }

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

    safeLogActivity({
      actorId: user.id,
      projectId: project.id,
      action: "project.created",
      message: `Project created: ${project.title}`
    });

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
    if (data.budget !== undefined && user.role !== "manager") {
      return res.status(403).json({ message: "Only managers can allocate project budgets" });
    }
    let deltaBudget = 0;
    if (data.budget !== undefined) {
      deltaBudget = data.budget - project.budget;
      if (deltaBudget > 0) {
        try {
          await ensureAvailable(deltaBudget);
        } catch {
          return res.status(400).json({ message: "Insufficient global budget" });
        }
      }
    }
    const prevStart = project.startDate;
    const prevEnd = project.endDate;
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
    if (deltaBudget !== 0) {
      await adjustAllocated(deltaBudget);
    }

    safeLogActivity({
      actorId: user.id,
      projectId: updated.id,
      action: "project.updated",
      message: `Project updated: ${updated.title}`,
      metadata: {
        changes: {
          startDate: data.start_date ? { from: prevStart, to: updated.startDate } : undefined,
          endDate: data.end_date ? { from: prevEnd, to: updated.endDate } : undefined
        }
      }
    });

    const startChanged =
      data.start_date && (!prevStart || prevStart.getTime() !== updated.startDate?.getTime());
    const endChanged =
      data.end_date && (!prevEnd || prevEnd.getTime() !== updated.endDate?.getTime());
    if (startChanged || endChanged) {
      const members = await prisma.projectMember.findMany({
        where: { projectId: updated.id },
        select: { userId: true }
      });
      const parts: string[] = [];
      if (startChanged) {
        parts.push(`start date: ${updated.startDate?.toISOString().slice(0, 10) || "-"}`);
      }
      if (endChanged) {
        parts.push(`end date: ${updated.endDate?.toISOString().slice(0, 10) || "-"}`);
      }
      await notifyUsers(
        [updated.managerId, ...members.map((m) => m.userId)],
        "Project dates updated",
        `Project \"${updated.title}\" updated (${parts.join(", ")}).`
      );
    }

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
    if (data.status === "done") {
      const remaining = await prisma.task.count({
        where: { projectId: id, status: { not: "done" } }
      });
      if (remaining > 0) {
        return res
          .status(400)
          .json({ message: "Cannot mark project done while tasks are incomplete" });
      }
    }
    const updated = await prisma.project.update({
      where: { id },
      data: { status: data.status }
    });

    safeLogActivity({
      actorId: user.id,
      projectId: updated.id,
      action: "project.status_changed",
      message: `Project status changed: ${updated.title} → ${data.status}`,
      metadata: { to: data.status }
    });

    const members = await prisma.projectMember.findMany({
      where: { projectId: updated.id },
      select: { userId: true }
    });
    await notifyUsers(
      [updated.managerId, ...members.map((m) => m.userId)],
      "Project status updated",
      `Project \"${updated.title}\" status changed to ${data.status}.`
    );

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

    const incompleteTasks = await prisma.task.count({
      where: { projectId: id, status: { not: "done" } }
    });
    if (incompleteTasks > 0) {
      return res.status(400).json({
        message: "Cannot delete project while tasks are incomplete"
      });
    }

    const projectTasks = await prisma.task.findMany({
      where: { projectId: id },
      select: { id: true }
    });
    const taskIds = projectTasks.map((task) => task.id);

    safeLogActivity({
      actorId: user.id,
      projectId: project.id,
      action: "project.deleted",
      message: `Project deleted: ${project.title}`
    });

    await prisma.$transaction([
      prisma.resource.deleteMany({ where: { projectId: id } }),
      prisma.file.deleteMany({ where: { projectId: id } }),
      prisma.report.deleteMany({ where: { projectId: id } }),
      prisma.projectMember.deleteMany({ where: { projectId: id } }),
      prisma.activity.deleteMany({
        where: {
          OR: [{ projectId: id }, ...(taskIds.length ? [{ taskId: { in: taskIds } }] : [])]
        }
      }),
      prisma.task.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } })
    ]);

    if (project.budget > 0) {
      await adjustAllocated(-project.budget);
    }
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
      safeLogActivity({
        actorId: user.id,
        projectId,
        action: "project.member_added",
        message: `Member added to project ${project.title}`,
        metadata: { userId }
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
    safeLogActivity({
      actorId: user.id,
      projectId,
      action: "project.member_removed",
      message: `Member removed from project ${project.title}`,
      metadata: { userId }
    });
    return res.json({ message: "Removed" });
  })
);

export default router;
