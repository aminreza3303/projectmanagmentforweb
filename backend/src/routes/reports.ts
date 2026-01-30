import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { reportSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    const where: any = {};

    if (req.query.projectId) {
      where.projectId = Number(req.query.projectId);
    }

    if (user.role !== "admin") {
      where.project = {
        OR: [{ managerId: user.id }, { members: { some: { userId: user.id } } }]
      };
    }

    const reports = await prisma.report.findMany({ where });
    return res.json(reports);
  })
);

router.get(
  "/summary",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    let projectIds: number[] = [];
    if (user.role === "admin") {
      const projects = await prisma.project.findMany({ select: { id: true } });
      projectIds = projects.map((p) => p.id);
    } else {
      const projects = await prisma.project.findMany({
        where: {
          OR: [{ managerId: user.id }, { members: { some: { userId: user.id } } }]
        },
        select: { id: true }
      });
      projectIds = projects.map((p) => p.id);
    }

    if (user.role !== "admin" && projectIds.length === 0) {
      return res.json({
        projects: 0,
        tasks: 0,
        tasksByStatus: { todo: 0, pending: 0, in_progress: 0, done: 0, on_hold: 0 },
        budgetTotal: 0,
        spentTotal: 0
      });
    }

    const [projectsCount, tasksCount, budgetSum, spentSum] = await Promise.all([
      prisma.project.count({ where: projectIds.length ? { id: { in: projectIds } } : {} }),
      prisma.task.count({ where: projectIds.length ? { projectId: { in: projectIds } } : {} }),
      prisma.project.aggregate({
        where: projectIds.length ? { id: { in: projectIds } } : {},
        _sum: { budget: true }
      }),
      prisma.project.aggregate({
        where: projectIds.length ? { id: { in: projectIds } } : {},
        _sum: { spent: true }
      })
    ]);

    const statuses = ["todo", "pending", "in_progress", "done", "on_hold"];
    const tasksByStatus = Object.fromEntries(
      await Promise.all(
        statuses.map(async (status) => {
          const count = await prisma.task.count({
            where: {
              status,
              ...(projectIds.length ? { projectId: { in: projectIds } } : {})
            }
          });
          return [status, count];
        })
      )
    );

    return res.json({
      projects: projectsCount,
      tasks: tasksCount,
      tasksByStatus,
      budgetTotal: budgetSum._sum.budget || 0,
      spentTotal: spentSum._sum.spent || 0
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const report = await prisma.report.findUnique({
      where: { id },
      include: { project: true }
    });
    if (!report) return res.status(404).json({ message: "Report not found" });

    const user = req.user!;
    if (user.role !== "admin") {
      const project = report.project;
      const isManager = project.managerId === user.id;
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: project.id, userId: user.id }
      });
      if (!isManager && !isMember) return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(report);
  })
);

router.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = reportSchema.parse(req.body);
    const report = await prisma.report.create({
      data: {
        projectId: data.project_id,
        type: data.type,
        content: data.content,
        createdBy: user.id
      }
    });
    return res.status(201).json(report);
  })
);

export default router;
