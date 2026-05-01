import { Area, TravelingExpenseStatus } from '@/generated/prisma'
import {
  getUserArea,
  getUserIdsByArea,
  getUsersByIds,
  listAllExpenses,
  listExpensesByUserIds,
  countAllExpenses,
  countExpensesByUserIds,
  getExpenseById,
  updateExpenseStatus,
  getResponsablesUserIdsByArea,
} from './traveling-expenses.repository'
import { mapToDto, PAGE_SIZE, type TravelingExpenseDto } from './traveling-expenses.service'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/nodemailer'

export interface ReviewExpenseDto extends TravelingExpenseDto {
  userName: string | null
  userArea: string
}

export interface ExpenseDetailDto extends ReviewExpenseDto {
  approvedBy: string | null
  approvedByAdmin: boolean
}

export interface ListReviewResult {
  expenses: ReviewExpenseDto[]
  page: number
  perPage: number
  total: number
}

export interface ReviewFilters {
  status?: string
  period?: string
  area?: string
}

export { PAGE_SIZE }

export async function listExpensesForReview(
  reviewerRole: string,
  reviewerUserId: string,
  page: number,
  perPage: number,
  filters?: ReviewFilters
): Promise<ListReviewResult> {
  let expenses: Awaited<ReturnType<typeof listAllExpenses>>
  let total: number

  const dbFilters = {
    status: filters?.status,
    period: filters?.period,
  }

  if (reviewerRole === 'RESPONSABLES') {
    const area = await getUserArea(reviewerUserId)
    if (!area) throw new Error('No tienes un área asignada en el sistema.')
    const userIds = await getUserIdsByArea(area)
    ;[expenses, total] = await Promise.all([
      listExpensesByUserIds(userIds, page, perPage, dbFilters),
      countExpensesByUserIds(userIds, dbFilters),
    ])
  } else if (filters?.area) {
    const userIds = await getUserIdsByArea(filters.area as Area)
    ;[expenses, total] = await Promise.all([
      listExpensesByUserIds(userIds, page, perPage, dbFilters),
      countExpensesByUserIds(userIds, dbFilters),
    ])
  } else {
    ;[expenses, total] = await Promise.all([
      listAllExpenses(page, perPage, dbFilters),
      countAllExpenses(dbFilters),
    ])
  }

  const uniqueUserIds = [...new Set(expenses.map((e) => e.userId))]
  const users = await getUsersByIds(uniqueUserIds)
  const userMap = new Map(users.map((u) => [u.userId, u]))

  return {
    expenses: expenses.map((e) => ({
      ...mapToDto(e),
      userName: userMap.get(e.userId)?.name ?? null,
      userArea: userMap.get(e.userId)?.area ?? '—',
    })),
    page,
    perPage,
    total,
  }
}

type Action = 'APPROVE' | 'REQUEST_CORRECTION' | 'REJECT'

const FINAL_STATUSES: TravelingExpenseStatus[] = ['APPROVED_BY_MANAGER', 'REJECTED']

export async function updateExpenseStatusService(
  expenseId: string,
  reviewerId: string,
  reviewerRole: string,
  action: Action,
  correctionReason?: string
): Promise<void> {
  const expense = await getExpenseById(expenseId)
  if (!expense) throw new Error('Gasto no encontrado.')

  if (FINAL_STATUSES.includes(expense.status)) {
    throw new Error('Este gasto ya ha sido procesado definitivamente.')
  }

  if (reviewerRole === 'RESPONSABLES') {
    const reviewerArea = await getUserArea(reviewerId)
    const ownerArea = await getUserArea(expense.userId)
    if (!reviewerArea || reviewerArea !== ownerArea) {
      throw new Error('No tienes acceso a este gasto.')
    }
  }

  if (
    action === 'APPROVE' &&
    reviewerRole === 'RESPONSABLES' &&
    expense.status !== 'APPROVED_BY_ADMIN'
  ) {
    throw new Error('Administración debe aprobar el gasto antes de que el responsable pueda aprobarlo.')
  }

  const statusMap: Record<Action, TravelingExpenseStatus> = {
    APPROVE: reviewerRole === 'RESPONSABLES' ? 'APPROVED_BY_MANAGER' : 'APPROVED_BY_ADMIN',
    REQUEST_CORRECTION: 'CORRECTION_REQUESTED',
    REJECT: 'REJECTED',
  }

  await updateExpenseStatus(expenseId, {
    status: statusMap[action],
    approvedBy: action === 'APPROVE' ? reviewerId : undefined,
    approvedByAdmin: action === 'APPROVE' && reviewerRole !== 'RESPONSABLES' ? true : undefined,
    correctionReason: action === 'REQUEST_CORRECTION' ? correctionReason : null,
  })

  if (action === 'APPROVE' && reviewerRole !== 'RESPONSABLES') {
    const ownerArea = await getUserArea(expense.userId)
    if (ownerArea) {
      const responsableIds = await getResponsablesUserIdsByArea(ownerArea)
      if (responsableIds.length > 0) {
        const supabase = createAdminClient()
        const emails = (
          await Promise.all(responsableIds.map((id) => supabase.auth.admin.getUserById(id)))
        )
          .map((r) => r.data.user?.email)
          .filter((e): e is string => !!e)

        await Promise.all(
          emails.map((email) =>
            sendEmail(
              email,
              'Gasto pendiente de tu aprobación',
              `Hola,\n\nAdministración ha aprobado un gasto del área ${ownerArea} y está pendiente de tu aprobación.\n\nPuedes revisarlo en la sección de revisión de gastos.\n\nSaludos.`
            ).catch(() => {})
          )
        )
      }
    }
  }
}

export async function getExpenseDetail(
  expenseId: string,
  reviewerId: string,
  reviewerRole: string
): Promise<ExpenseDetailDto> {
  const expense = await getExpenseById(expenseId)
  if (!expense) throw new Error('Gasto no encontrado.')

  if (reviewerRole === 'RESPONSABLES') {
    const reviewerArea = await getUserArea(reviewerId)
    const ownerArea = await getUserArea(expense.userId)
    if (!reviewerArea || reviewerArea !== ownerArea) {
      throw new Error('No tienes acceso a este gasto.')
    }
  }

  const users = await getUsersByIds([expense.userId])
  const user = users[0]

  return {
    ...mapToDto(expense),
    approvedBy: expense.approvedBy,
    approvedByAdmin: expense.approvedByAdmin,
    userName: user?.name ?? null,
    userArea: user?.area ?? '—',
  }
}
