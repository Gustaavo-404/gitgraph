import { prisma } from "@/lib/prisma";

export async function getProjectById(
  projectId: string,
  userId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });
}