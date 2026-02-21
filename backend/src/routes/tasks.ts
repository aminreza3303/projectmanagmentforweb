import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { statusSchema, taskSchema, taskUpdateSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { isProjectMember, isProjectManager } from "../utils/access";
import { safeLogActivity } from "../utils/activity";
import { notifyUsers } from "../utils/notify";

const router = Router();

router.use(requireAuth);

router.get(
  "/projects/:id/tasks",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin") {
      const allowed = await isProjectMember(user.id, projectId);
      const isManager = project.managerId === user.id;
      if (!allowed && !isManager) return res.status(403).json({ message: "Forbidden" });
    }

    const { status, assigneeId, q } = req.query;
    const where: any = { projectId };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = Number(assigneeId);
    if (q) where.title = { contains: String(q), mode: "insensitive" };

    const tasks = await prisma.task.findMany({
      where,
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
    return res.json(tasks);
  })
);

router.post(
  "/projects/:id/tasks",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = taskSchema.parse(req.body);
    const assignee = await prisma.user.findUnique({ where: { id: data.assignee_id } });
    if (!assignee) return res.status(400).json({ message: "Assignee not found" });
    const dueDate = data.due_date ? new Date(data.due_date) : undefined;
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({ message: "Invalid task due date" });
    }
    if (dueDate && project.startDate && dueDate < project.startDate) {
      return res.status(400).json({
        message: "Task due date must be on or after project start date"
      });
    }
    if (dueDate && project.endDate && dueDate > project.endDate) {
      return res.status(400).json({
        message: "Task due date must be on or before project end date"
      });
    }
    const cost = data.cost ?? 0;
    if (project.budget < project.spent + cost) {
      return res.status(400).json({ message: "Insufficient project budget" });
    }

    const [task] = await prisma.$transaction([
      prisma.task.create({
        data: {
          projectId,
          title: data.title,
          description: data.description,
          dueDate,
          status: data.status || "pending",
          priority: data.priority ?? 0,
          cost,
          assigneeId: data.assignee_id
        }
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { spent: { increment: cost } }
      }),
      prisma.projectMember.upsert({
        where: { projectId_userId: { projectId, userId: data.assignee_id } },
        update: {},
        create: { projectId, userId: data.assignee_id }
      })
    ]);

    safeLogActivity({
      actorId: user.id,
      projectId,
      taskId: task.id,
      action: "task.created",
      message: `Task created: ${task.title}`
    });

    return res.status(201).json(task);
  })
);

router.get(
  "/tasks/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = req.user!;
    if (user.role !== "admin") {
      const allowed = await isProjectMember(user.id, task.projectId);
      const isManager = await isProjectManager(user.id, task.projectId);
      if (!allowed && !isManager) return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(task);
  })
);

router.put(
  "/tasks/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = req.user!;
    const isManager = await isProjectManager(user.id, task.projectId);
    if (user.role !== "admin" && !isManager) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = taskUpdateSchema.parse(req.body);
    if (data.assignee_id) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assignee_id } });
      if (!assignee) return res.status(400).json({ message: "Assignee not found" });
    }
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });
    let nextDueDate = task.dueDate;
    if (data.due_date) {
      nextDueDate = new Date(data.due_date);
      if (Number.isNaN(nextDueDate.getTime())) {
        return res.status(400).json({ message: "Invalid task due date" });
      }
    }
    if (nextDueDate && project.startDate && nextDueDate < project.startDate) {
      return res.status(400).json({
        message: "Task due date must be on or after project start date"
      });
    }
    if (nextDueDate && project.endDate && nextDueDate > project.endDate) {
      return res.status(400).json({
        message: "Task due date must be on or before project end date"
      });
    }
    const newCost = data.cost ?? task.cost;
    const delta = newCost - task.cost;
    if (delta > 0 && project.budget < project.spent + delta) {
      return res.status(400).json({ message: "Insufficient project budget" });
    }

    const prevStatus = task.status;
    const prevDueDate = task.dueDate;
    const prevAssignee = task.assigneeId;

    const [updated] = await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          dueDate: data.due_date ? new Date(data.due_date) : undefined,
          status: data.status,
          priority: data.priority,
          cost: data.cost,
          assigneeId: data.assignee_id
        }
      }),
      prisma.project.update({
        where: { id: task.projectId },
        data: { spent: { increment: delta } }
      }),
      ...(data.assignee_id
        ? [
            prisma.projectMember.upsert({
              where: { projectId_userId: { projectId: task.projectId, userId: data.assignee_id } },
              update: {},
              create: { projectId: task.projectId, userId: data.assignee_id }
            })
          ]
        : [])
    ]);

    safeLogActivity({
      actorId: user.id,
      projectId: task.projectId,
      taskId: updated.id,
      action: "task.updated",
      message: `Task updated: ${updated.title}`
    });

    const statusChanged = data.status && data.status !== prevStatus;
    const dueChanged =
      data.due_date &&
      (!prevDueDate || prevDueDate.getTime() !== updated.dueDate?.getTime());
    const assigneeChanged = data.assignee_id && data.assignee_id !== prevAssignee;

    const managerId = project?.managerId;

    if (statusChanged) {
      await notifyUsers(
        [updated.assigneeId, managerId],
        "Task status updated",
        `Task \"${updated.title}\" status changed to ${updated.status}.`
      );
      safeLogActivity({
        actorId: user.id,
        projectId: task.projectId,
        taskId: updated.id,
        action: "task.status_changed",
        message: `Task status changed: ${updated.title} → ${updated.status}`,
        metadata: { to: updated.status }
      });
    }

    if (dueChanged) {
      await notifyUsers(
        [updated.assigneeId, managerId],
        "Task due date updated",
        `Task \"${updated.title}\" due date changed to ${updated.dueDate?.toISOString().slice(0, 10) || "-"}.`
      );
    }

    if (assigneeChanged) {
      await notifyUsers(
        [updated.assigneeId],
        "Task assignment updated",
        `You have been assigned to task \"${updated.title}\".`
      );
    }

    return res.json(updated);
  })
);

router.delete(
  "/tasks/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = req.user!;
    const isManager = await isProjectManager(user.id, task.projectId);
    if (user.role !== "admin" && !isManager) {
      return res.status(403).json({ message: "Forbidden" });
    }

    safeLogActivity({
      actorId: user.id,
      projectId: task.projectId,
      taskId: task.id,
      action: "task.deleted",
      message: `Task deleted: ${task.title}`
    });

    await prisma.$transaction([
      prisma.resource.deleteMany({ where: { taskId: id } }),
      prisma.file.deleteMany({ where: { taskId: id } }),
      prisma.task.delete({ where: { id } }),
      prisma.project.update({
        where: { id: task.projectId },
        data: { spent: { decrement: task.cost } }
      })
    ]);
    return res.json({ message: "Deleted" });
  })
);

router.patch(
  "/tasks/:id/status",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = req.user!;
    const isManager = await isProjectManager(user.id, task.projectId);
    if (user.role !== "admin" && !isManager && task.assigneeId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = statusSchema.parse(req.body);
    const updated = await prisma.task.update({
      where: { id },
      data: { status: data.status }
    });

    safeLogActivity({
      actorId: user.id,
      projectId: task.projectId,
      taskId: task.id,
      action: "task.status_changed",
      message: `Task status changed: ${task.title} → ${data.status}`,
      metadata: { to: data.status }
    });

    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    await notifyUsers(
      [task.assigneeId, project?.managerId],
      "Task status updated",
      `Task \"${task.title}\" status changed to ${data.status}.`
    );

    return res.json(updated);
  })
);

export default router;
