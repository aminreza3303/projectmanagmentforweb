import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { resourceCatalogSchema, resourceSchema, resourceUpdateSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { safeLogActivity } from "../utils/activity";
import { notifyUsers } from "../utils/notify";

const router = Router();
const getLowThreshold = () => {
  const parsed = Number(process.env.LOW_RESOURCE_THRESHOLD);
  return Number.isFinite(parsed) ? parsed : 1;
};

router.use(requireAuth);

router.get(
  "/resources",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const resources = await prisma.resource.findMany({
      include: {
        resourceItem: true,
        project: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } }
      }
    });
    return res.json(resources);
  })
);

router.get(
  "/resources/catalog",
  asyncHandler(async (_req: AuthedRequest, res) => {
    const items = await prisma.resourceItem.findMany();
    return res.json(items);
  })
);

router.post(
  "/resources/catalog",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const data = resourceCatalogSchema.parse(req.body);
    const item = await prisma.resourceItem.create({ data });
    safeLogActivity({
      actorId: user.id,
      action: "resource.catalog_added",
      message: `Resource catalog item added: ${item.name}`,
      metadata: { resourceItemId: item.id }
    });
    return res.status(201).json(item);
  })
);

router.get(
  "/projects/:id/resources",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const resources = await prisma.resource.findMany({
      where: { projectId },
      include: { resourceItem: true, task: { select: { id: true, title: true } } }
    });
    return res.json(resources);
  })
);

router.post(
  "/projects/:id/resources",
  asyncHandler(async (req: AuthedRequest, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = resourceSchema.parse(req.body);
    let resourceItem = null;
    if (data.resourceItemId) {
      resourceItem = await prisma.resourceItem.findUnique({
        where: { id: data.resourceItemId }
      });
      if (!resourceItem) {
        return res.status(400).json({ message: "Invalid resourceItemId" });
      }
    }
    const resource = await prisma.resource.create({
      data: {
        projectId,
        taskId: data.task_id,
        resourceItemId: data.resourceItemId,
        type: data.type || resourceItem?.type,
        name: data.name || resourceItem?.name,
        amount: data.amount,
        unit: data.unit || resourceItem?.unit,
        notes: data.notes
      }
    });

    safeLogActivity({
      actorId: user.id,
      projectId,
      taskId: data.task_id,
      action: "resource.added",
      message: `Resource added to project ${project.title}`,
      metadata: { resourceId: resource.id }
    });

    if (resource.amount <= getLowThreshold()) {
      await notifyUsers(
        [project.managerId],
        "Low resource alert",
        `Resource \"${resource.name || resource.type}\" is low (${resource.amount}).`
      );
    }

    return res.status(201).json(resource);
  })
);

router.put(
  "/resources/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    const project = await prisma.project.findUnique({ where: { id: resource.projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = resourceUpdateSchema.parse(req.body);
    let resourceItem = null;
    if (data.resourceItemId) {
      resourceItem = await prisma.resourceItem.findUnique({
        where: { id: data.resourceItemId }
      });
      if (!resourceItem) {
        return res.status(400).json({ message: "Invalid resourceItemId" });
      }
    }
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        taskId: data.task_id,
        resourceItemId: data.resourceItemId,
        type: data.type || resourceItem?.type,
        name: data.name || resourceItem?.name,
        amount: data.amount,
        unit: data.unit || resourceItem?.unit,
        notes: data.notes
      }
    });

    safeLogActivity({
      actorId: user.id,
      projectId: project.id,
      taskId: updated.taskId ?? undefined,
      action: "resource.updated",
      message: `Resource updated in project ${project.title}`,
      metadata: { resourceId: updated.id }
    });

    if (updated.amount <= getLowThreshold()) {
      await notifyUsers(
        [project.managerId],
        "Low resource alert",
        `Resource \"${updated.name || updated.type}\" is low (${updated.amount}).`
      );
    }

    return res.json(updated);
  })
);

router.delete(
  "/resources/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    const project = await prisma.project.findUnique({ where: { id: resource.projectId } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user!;
    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    safeLogActivity({
      actorId: user.id,
      projectId: project.id,
      taskId: resource.taskId ?? undefined,
      action: "resource.deleted",
      message: `Resource removed from project ${project.title}`,
      metadata: { resourceId: resource.id }
    });

    await prisma.resource.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  })
);

export default router;
