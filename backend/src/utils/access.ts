import { prisma } from "../db";

export const isProjectMember = async (userId: number, projectId: number): Promise<boolean> => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId }
  });
  return !!member;
};

export const isProjectManager = async (userId: number, projectId: number): Promise<boolean> => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  return project ? project.managerId === userId : false;
};
