import { ExpenseCategory, Area, TravelingExpenseStatus } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'

export interface CreateExpenseData {
  id: string
  userId: string
  project?: string
  period?: string
  description?: string
  totalAmount: number
  items: {
    id: string
    date: Date
    category: ExpenseCategory
    amount: number
    isInternational: boolean
    startingLocation?: string
    destination?: string
    distance?: number
    description?: string
    ticket?: string
  }[]
}

export async function createTravelingExpense(data: CreateExpenseData) {
  return prisma.travelingExpense.create({
    data: {
      id: data.id,
      userId: data.userId,
      project: data.project,
      period: data.period,
      description: data.description,
      totalAmount: data.totalAmount,
      expenseItems: {
        create: data.items.map((item) => ({
          id: item.id,
          date: item.date,
          category: item.category,
          amount: item.amount,
          isInternational: item.isInternational,
          startingLocation: item.startingLocation,
          destination: item.destination,
          distance: item.distance,
          description: item.description,
          ticket: item.ticket,
        })),
      },
    },
    include: {
      expenseItems: true,
      comments: {
        select: { id: true, userId: true, userName: true, message: true, createdAt: true },
      },
    },
  })
}

export async function listByUserId(
  userId: string,
  page: number,
  perPage: number,
  filters?: { status?: string; period?: string }
) {
  const where = {
    userId,
    ...(filters?.status && { status: filters.status as TravelingExpenseStatus }),
    ...(filters?.period && { period: filters.period }),
  }
  return prisma.travelingExpense.findMany({
    where,
    include: {
      expenseItems: true,
      comments: {
        select: { id: true, userId: true, userName: true, message: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
  })
}

export async function countByUserId(userId: string, filters?: { status?: string; period?: string }) {
  const where = {
    userId,
    ...(filters?.status && { status: filters.status as TravelingExpenseStatus }),
    ...(filters?.period && { period: filters.period }),
  }
  return prisma.travelingExpense.count({ where })
}

export async function getUserArea(userId: string): Promise<Area | null> {
  const user = await prisma.user.findUnique({ where: { userId }, select: { area: true } })
  return user?.area ?? null
}

export async function getUserIdsByArea(area: Area): Promise<string[]> {
  const users = await prisma.user.findMany({ where: { area }, select: { userId: true } })
  return users.map((u) => u.userId)
}

export async function getUsersByIds(userIds: string[]) {
  return prisma.user.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, name: true, area: true },
  })
}

export async function listAllExpenses(
  page: number,
  perPage: number,
  filters?: { status?: string; period?: string }
) {
  const where = {
    ...(filters?.status && { status: filters.status as TravelingExpenseStatus }),
    ...(filters?.period && { period: filters.period }),
  }
  return prisma.travelingExpense.findMany({
    where,
    include: {
      expenseItems: true,
      comments: {
        select: { id: true, userId: true, userName: true, message: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
  })
}

export async function listExpensesByUserIds(
  userIds: string[],
  page: number,
  perPage: number,
  filters?: { status?: string; period?: string }
) {
  const where = {
    userId: { in: userIds },
    ...(filters?.status && { status: filters.status as TravelingExpenseStatus }),
    ...(filters?.period && { period: filters.period }),
  }
  return prisma.travelingExpense.findMany({
    where,
    include: {
      expenseItems: true,
      comments: {
        select: { id: true, userId: true, userName: true, message: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
  })
}

export async function countAllExpenses(filters?: { status?: string; period?: string }) {
  const where = {
    ...(filters?.status && { status: filters.status as TravelingExpenseStatus }),
    ...(filters?.period && { period: filters.period }),
  }
  return prisma.travelingExpense.count({ where })
}

export async function countExpensesByUserIds(
  userIds: string[],
  filters?: { status?: string; period?: string }
) {
  const where = {
    userId: { in: userIds },
    ...(filters?.status && { status: filters.status as TravelingExpenseStatus }),
    ...(filters?.period && { period: filters.period }),
  }
  return prisma.travelingExpense.count({ where })
}

export async function getExpenseById(id: string) {
  return prisma.travelingExpense.findUnique({
    where: { id },
    include: {
      expenseItems: true,
      comments: {
        select: { id: true, userId: true, userName: true, message: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function updateExpenseStatus(
  id: string,
  data: {
    status: TravelingExpenseStatus
    approvedBy?: string
    approvedByAdmin?: boolean
    correctionReason?: string | null
  }
) {
  return prisma.travelingExpense.update({ where: { id }, data })
}

export interface UpdateExpenseData {
  project?: string
  period?: string
  description?: string
  totalAmount: number
  items: {
    id: string
    date: Date
    category: ExpenseCategory
    amount: number
    isInternational: boolean
    startingLocation?: string
    destination?: string
    distance?: number
    description?: string
    ticket?: string
  }[]
}

export async function updateTravelingExpense(id: string, data: UpdateExpenseData) {
  return prisma.$transaction(async (tx) => {
    await tx.expenseItem.deleteMany({ where: { travelingExpenseId: id } })
    return tx.travelingExpense.update({
      where: { id },
      data: {
        project: data.project ?? null,
        period: data.period ?? null,
        description: data.description ?? null,
        totalAmount: data.totalAmount,
        status: 'PENDING',
        correctionReason: null,
        approvedBy: null,
        expenseItems: {
          create: data.items.map((item) => ({
            id: item.id,
            date: item.date,
            category: item.category,
            amount: item.amount,
            isInternational: item.isInternational,
            startingLocation: item.startingLocation ?? null,
            destination: item.destination ?? null,
            distance: item.distance ?? null,
            description: item.description ?? null,
            ticket: item.ticket ?? null,
          })),
        },
      },
      include: {
        expenseItems: true,
        comments: {
          select: { id: true, userId: true, userName: true, message: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  })
}

export async function createExpenseComment(data: {
  id: string
  travelingExpenseId: string
  userId: string
  userName?: string
  message: string
}) {
  return prisma.expenseComment.create({ data })
}

export async function getCommentsByExpenseId(travelingExpenseId: string) {
  return prisma.expenseComment.findMany({
    where: { travelingExpenseId },
    orderBy: { createdAt: 'asc' },
  })
}
