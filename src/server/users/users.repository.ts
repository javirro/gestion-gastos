import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function getRolesByUserIds(userIds: string[]) {
  return prisma.userRole.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, role: true },
  });
}
