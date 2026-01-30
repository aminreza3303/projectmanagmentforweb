import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { asyncHandler } from "../utils/async-handler";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { isProjectManager, isProjectMember } from "../utils/access";

const router = Router();

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

router.use(requireAuth);

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    const { projectId, taskId } = req.body as { projectId?: string; taskId?: string };
    if (!req.file || !projectId) {
      return res.status(400).json({ message: "file and projectId are required" });
    }

    const project = await prisma.project.findUnique({ where: { id: Number(projectId) } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (user.role !== "admin" && project.managerId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const file = await prisma.file.create({
      data: {
        projectId: Number(projectId),
        taskId: taskId ? Number(taskId) : undefined,
        path: req.file.filename,
        originalName: req.file.originalname,
        uploadedBy: user.id
      }
    });
    return res.status(201).json(file);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return res.status(404).json({ message: "File not found" });

    const user = req.user!;
    const allowed =
      user.role === "admin" ||
      (await isProjectManager(user.id, file.projectId)) ||
      (await isProjectMember(user.id, file.projectId));
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    const filePath = path.join(uploadDir, file.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File missing" });
    return res.download(filePath, file.originalName);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return res.status(404).json({ message: "File not found" });

    const user = req.user!;
    const allowed = user.role === "admin" || (await isProjectManager(user.id, file.projectId));
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    await prisma.file.delete({ where: { id } });

    const filePath = path.join(uploadDir, file.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res.json({ message: "Deleted" });
  })
);

export default router;
