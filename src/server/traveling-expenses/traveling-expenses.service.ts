import { uploadFile } from '@/server/supabase-files/supabase-files.service'
import {
  createTravelingExpense,
  listByUserId,
  countByUserId,
} from './traveling-expenses.repository'
import type { ExpenseCategory } from '@/generated/prisma/client'

const BUCKET = 'tickets'
export const PAGE_SIZE = 10

export interface ExpenseItemInput {
  date: string
  category: ExpenseCategory
  amount: number
  startingLocation?: string
  destination?: string
  description?: string
}

export interface CreateExpenseInput {
  project?: string
  description?: string
  isInternational: boolean
  items: ExpenseItemInput[]
}

export interface ExpenseItemDto {
  id: string
  date: string
  category: string
  amount: number
  startingLocation: string | null
  destination: string | null
  description: string | null
  ticket: string | null
  createdAt: string
}

export interface TravelingExpenseDto {
  id: string
  userId: string
  project: string | null
  totalAmount: number
  description: string | null
  isInternational: boolean
  status: string
  correctionReason: string | null
  createdAt: string
  expenseItems: ExpenseItemDto[]
}

export interface ListExpensesResult {
  expenses: TravelingExpenseDto[]
  page: number
  perPage: number
  total: number
}

export async function createExpense(
  userId: string,
  input: CreateExpenseInput,
  files: Map<number, File>
): Promise<TravelingExpenseDto> {
  const expenseId = crypto.randomUUID()

  const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0)

  const itemsWithTickets = await Promise.all(
    input.items.map(async (item, index) => {
      const itemId = crypto.randomUUID()
      let ticketUrl: string | undefined

      const file = files.get(index)
      if (file) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${expenseId}/${itemId}.${ext}`
        const result = await uploadFile({
          bucket: BUCKET,
          path,
          file,
          contentType: file.type,
          upsert: false,
        })
        ticketUrl = result.publicUrl
      }

      return {
        id: itemId,
        date: new Date(item.date),
        category: item.category,
        amount: item.amount,
        startingLocation: item.startingLocation,
        destination: item.destination,
        description: item.description,
        ticket: ticketUrl,
      }
    })
  )

  const expense = await createTravelingExpense({
    id: expenseId,
    userId,
    project: input.project,
    description: input.description,
    isInternational: input.isInternational,
    totalAmount,
    items: itemsWithTickets,
  })

  return mapToDto(expense)
}

export async function listUserExpenses(
  userId: string,
  page: number,
  perPage: number
): Promise<ListExpensesResult> {
  const [expenses, total] = await Promise.all([
    listByUserId(userId, page, perPage),
    countByUserId(userId),
  ])

  return {
    expenses: expenses.map(mapToDto),
    page,
    perPage,
    total,
  }
}

export function mapToDto(expense: {
  id: string
  userId: string
  project: string | null
  totalAmount: unknown
  description: string | null
  isInternational: boolean
  status: string
  correctionReason: string | null
  createdAt: Date
  expenseItems: {
    id: string
    date: Date
    category: string
    amount: unknown
    startingLocation: string | null
    destination: string | null
    description: string | null
    ticket: string | null
    createdAt: Date
  }[]
}): TravelingExpenseDto {
  return {
    id: expense.id,
    userId: expense.userId,
    project: expense.project,
    totalAmount: Number(expense.totalAmount),
    description: expense.description,
    isInternational: expense.isInternational,
    status: expense.status,
    correctionReason: expense.correctionReason,
    createdAt: expense.createdAt.toISOString(),
    expenseItems: expense.expenseItems.map((item) => ({
      id: item.id,
      date: item.date.toISOString(),
      category: item.category,
      amount: Number(item.amount),
      startingLocation: item.startingLocation,
      destination: item.destination,
      description: item.description,
      ticket: item.ticket,
      createdAt: item.createdAt.toISOString(),
    })),
  }
}
