import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { notificationSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthedRequest, requireRole } from "../middleware/auth";
import { safeLogActivity } from "../utils/activity";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = req.user!;
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id }
    });
    return res.json(notifications);
  })
);

router.patch(
  "/:id/read",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    const user = req.user!;
    if (notification.userId !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    });
    return res.json(updated);
  })
);

router.post(
  "/",
  requireRole(["admin", "manager"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = notificationSchema.parse(req.body);
    const notification = await prisma.notification.create({
      data: {
        userId: data.user_id,
        title: data.title,
        body: data.body
      }
    });
    safeLogActivity({
      actorId: req.user?.id,
      action: "notification.sent",
      message: `Notification sent: ${data.title}`,
      metadata: { userId: data.user_id, notificationId: notification.id }
    });
    return res.status(201).json(notification);
  })
);

export default router;
