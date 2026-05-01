import { Role, Area } from '@/generated/prisma'
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

export async function getUserIdsByFilters(filters: { role?: string; area?: string }): Promise<string[]> {
  const { role, area } = filters

  if (role && area) {
    const [roleRows, areaRows] = await Promise.all([
      prisma.userRole.findMany({ where: { role: role as Role }, select: { userId: true } }),
      prisma.user.findMany({ where: { area: area as Area }, select: { userId: true } }),
    ])
    const areaSet = new Set(areaRows.map((r) => r.userId))
    return roleRows.map((r) => r.userId).filter((id) => areaSet.has(id))
  }

  if (role) {
    const rows = await prisma.userRole.findMany({ where: { role: role as Role }, select: { userId: true } })
    return rows.map((r) => r.userId)
  }

  const rows = await prisma.user.findMany({ where: { area: area as Area }, select: { userId: true } })
  return rows.map((r) => r.userId)
}
