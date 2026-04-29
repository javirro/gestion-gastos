import { Role, Area } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

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

export async function getUserProfiles(userIds: string[]) {
  return prisma.user.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, name: true, area: true },
  });
}

export async function updateUserProfile(userId: string, data: { name?: string; area: Area }) {
  return prisma.user.upsert({
    where: { userId },
    update: { name: data.name ?? null, area: data.area },
    create: { userId, name: data.name, area: data.area },
  });
}

export async function replaceUserRole(userId: string, role: Role) {
  await prisma.userRole.deleteMany({ where: { userId } });
  return prisma.userRole.create({ data: { userId, role } });
}
