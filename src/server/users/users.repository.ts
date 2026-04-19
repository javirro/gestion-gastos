import { PrismaClient, Role, Area } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function getRolesByUserIds(userIds: string[]) {
  return prisma.userRole.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, role: true },
  });
}

export async function createUserRole(userId: string, role: Role) {
  return prisma.userRole.create({
    data: { userId, role },
  });
}

export async function createUserProfile(userId: string, data: { name?: string; area: Area }) {
  return prisma.user.create({
    data: { userId, name: data.name, area: data.area },
  });
}
