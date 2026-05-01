import { uploadFile } from '@/server/supabase-files/supabase-files.service'
import {
  createTravelingExpense,
  listByUserId,
  countByUserId,
  getExpenseById,
  updateTravelingExpense,
  createExpenseComment,
} from './traveling-expenses.repository'
import type { ExpenseCategory } from '@/generated/prisma'

const BUCKET = 'tickets'
export const PAGE_SIZE = 10

export interface ExpenseItemInput {
  date: string
  category: ExpenseCategory
  amount: number
  isInternational: boolean
  startingLocation?: string
  destination?: string
  distance?: number
  description?: string
}

export interface CreateExpenseInput {
  project?: string
  period?: string
  description?: string
  items: ExpenseItemInput[]
}

export interface ExpenseItemDto {
  id: string
  date: string
  category: string
  amount: number
  isInternational: boolean
  startingLocation: string | null
  destination: string | null
  distance: number | null
  description: string | null
  ticket: string | null
  createdAt: string
}

export interface ExpenseCommentDto {
  id: string
  userId: string
  userName: string | null
  message: string
  createdAt: string
}

export interface TravelingExpenseDto {
  id: string
  userId: string
  project: string | null
  period: string | null
  totalAmount: number
  description: string | null
  status: string
  correctionReason: string | null
  createdAt: string
  expenseItems: ExpenseItemDto[]
  comments: ExpenseCommentDto[]
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
        isInternational: item.isInternational,
        startingLocation: item.startingLocation,
        destination: item.destination,
        distance: item.distance,
        description: item.description,
        ticket: ticketUrl,
      }
    })
  )

  const expense = await createTravelingExpense({
    id: expenseId,
    userId,
    project: input.project,
    period: input.period,
    description: input.description,
    totalAmount,
    items: itemsWithTickets,
  })

  return mapToDto(expense)
}

export async function listUserExpenses(
  userId: string,
  page: number,
  perPage: number,
  filters?: { status?: string; period?: string }
): Promise<ListExpensesResult> {
  const [expenses, total] = await Promise.all([
    listByUserId(userId, page, perPage, filters),
    countByUserId(userId, filters),
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
  period: string | null
  totalAmount: unknown
  description: string | null
  status: string
  correctionReason: string | null
  createdAt: Date
  expenseItems: {
    id: string
    date: Date
    category: string
    amount: unknown
    isInternational: boolean
    startingLocation: string | null
    destination: string | null
    distance: unknown
    description: string | null
    ticket: string | null
    createdAt: Date
  }[]
  comments: {
    id: string
    userId: string
    userName: string | null
    message: string
    createdAt: Date
  }[]
}): TravelingExpenseDto {
  return {
    id: expense.id,
    userId: expense.userId,
    project: expense.project,
    period: expense.period,
    totalAmount: Number(expense.totalAmount),
    description: expense.description,
    status: expense.status,
    correctionReason: expense.correctionReason,
    createdAt: expense.createdAt.toISOString(),
    expenseItems: expense.expenseItems.map((item) => ({
      id: item.id,
      date: item.date.toISOString(),
      category: item.category,
      amount: Number(item.amount),
      isInternational: item.isInternational,
      startingLocation: item.startingLocation,
      destination: item.destination,
      distance: item.distance != null ? Number(item.distance) : null,
      description: item.description,
      ticket: item.ticket,
      createdAt: item.createdAt.toISOString(),
    })),
    comments: expense.comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.userName,
      message: c.message,
      createdAt: c.createdAt.toISOString(),
    })),
  }
}

export async function getOwnExpenseDetail(
  expenseId: string,
  userId: string
): Promise<TravelingExpenseDto> {
  const expense = await getExpenseById(expenseId)
  if (!expense) throw new Error('Gasto no encontrado.')
  if (expense.userId !== userId) throw new Error('No tienes acceso a este gasto.')
  return mapToDto(expense)
}

const EDITABLE_STATUSES = ['PENDING', 'CORRECTION_REQUESTED']

export interface EditExpenseItemInput {
  date: string
  category: string
  amount: number
  isInternational: boolean
  startingLocation?: string
  destination?: string
  distance?: number
  description?: string
  existingTicketUrl?: string
}

export interface EditExpenseInput {
  project?: string
  period?: string
  description?: string
  items: EditExpenseItemInput[]
}

export async function editExpense(
  expenseId: string,
  userId: string,
  input: EditExpenseInput,
  files: Map<number, File>
): Promise<TravelingExpenseDto> {
  const existing = await getExpenseById(expenseId)
  if (!existing) throw new Error('Gasto no encontrado.')
  if (existing.userId !== userId) throw new Error('No tienes acceso a este gasto.')
  if (!EDITABLE_STATUSES.includes(existing.status)) {
    throw new Error('Solo puedes editar gastos en estado pendiente o con corrección solicitada.')
  }

  const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0)

  const items = await Promise.all(
    input.items.map(async (item, index) => {
      const itemId = crypto.randomUUID()
      let ticketUrl: string | undefined = item.existingTicketUrl
      const file = files.get(index)
      if (file) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${expenseId}/${itemId}.${ext}`
        const result = await uploadFile({ bucket: BUCKET, path, file, contentType: file.type, upsert: true })
        ticketUrl = result.publicUrl
      }
      return {
        id: itemId,
        date: new Date(item.date),
        category: item.category as ExpenseCategory,
        amount: item.amount,
        isInternational: item.isInternational,
        startingLocation: item.startingLocation,
        destination: item.destination,
        distance: item.distance,
        description: item.description,
        ticket: ticketUrl,
      }
    })
  )

  const updated = await updateTravelingExpense(expenseId, {
    project: input.project,
    period: input.period,
    description: input.description,
    totalAmount,
    items,
  })
  return mapToDto(updated)
}

export async function addComment(
  expenseId: string,
  userId: string,
  userName: string | undefined,
  message: string
): Promise<ExpenseCommentDto> {
  const expense = await getExpenseById(expenseId)
  if (!expense) throw new Error('Gasto no encontrado.')

  const comment = await createExpenseComment({
    id: crypto.randomUUID(),
    travelingExpenseId: expenseId,
    userId,
    userName,
    message,
  })

  return {
    id: comment.id,
    userId: comment.userId,
    userName: comment.userName,
    message: comment.message,
    createdAt: comment.createdAt.toISOString(),
  }
}
