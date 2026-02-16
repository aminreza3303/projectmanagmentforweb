import { prisma } from "../db";

export type ActivityInput = {
  actorId?: number;
  projectId?: number;
  taskId?: number;
  action: string;
  message: string;
  metadata?: string | Record<string, unknown>;
};

export const logActivity = async (input: ActivityInput) => {
  const metadata =
    input.metadata && typeof input.metadata === "string"
      ? input.metadata
      : input.metadata
      ? JSON.stringify(input.metadata)
      : undefined;
  return prisma.activity.create({
    data: {
      actorId: input.actorId,
      projectId: input.projectId,
      taskId: input.taskId,
      action: input.action,
      message: input.message,
      metadata
    }
  });
};

export const safeLogActivity = (input: ActivityInput) => {
  void logActivity(input).catch(() => {});
};
