import { PrismaClient, ExpenseCategory, Area, TravelingExpenseStatus } from '@/generated/prisma/client'

const prisma = new PrismaClient()

export interface CreateExpenseData {
  id: string
  userId: string
  project?: string
  description?: string
  isInternational: boolean
  totalAmount: number
  items: {
    id: string
    date: Date
    category: ExpenseCategory
    amount: number
    startingLocation?: string
    destination?: string
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
      description: data.description,
      isInternational: data.isInternational,
      totalAmount: data.totalAmount,
      expenseItems: {
        create: data.items.map((item) => ({
          id: item.id,
          date: item.date,
          category: item.category,
          amount: item.amount,
          startingLocation: item.startingLocation,
          destination: item.destination,
          description: item.description,
          ticket: item.ticket,
        })),
      },
    },
    include: { expenseItems: true },
  })
}

export async function listByUserId(userId: string, page: number, perPage: number) {
  return prisma.travelingExpense.findMany({
    where: { userId },
    include: { expenseItems: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
  })
}

export async function countByUserId(userId: string) {
  return prisma.travelingExpense.count({ where: { userId } })
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

export async function listAllExpenses(page: number, perPage: number) {
  return prisma.travelingExpense.findMany({
    include: { expenseItems: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
  })
}

export async function listExpensesByUserIds(userIds: string[], page: number, perPage: number) {
  return prisma.travelingExpense.findMany({
    where: { userId: { in: userIds } },
    include: { expenseItems: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
  })
}

export async function countAllExpenses() {
  return prisma.travelingExpense.count()
}

export async function countExpensesByUserIds(userIds: string[]) {
  return prisma.travelingExpense.count({ where: { userId: { in: userIds } } })
}

export async function getExpenseById(id: string) {
  return prisma.travelingExpense.findUnique({ where: { id }, include: { expenseItems: true } })
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
