import { prisma } from "../db";

export const createNotification = async (userId: number, title: string, body: string) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      body
    }
  });
};

export const notifyUsers = async (userIds: Array<number | null | undefined>, title: string, body: string) => {
  const ids = Array.from(new Set(userIds.filter((id): id is number => Number.isInteger(id))));
  if (!ids.length) return;
  await prisma.notification.createMany({
    data: ids.map((id) => ({ userId: id, title, body }))
  });
};
