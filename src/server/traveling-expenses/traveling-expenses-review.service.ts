import { TravelingExpenseStatus } from '@/generated/prisma/client'
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
} from './traveling-expenses.repository'
import { mapToDto, PAGE_SIZE, type TravelingExpenseDto } from './traveling-expenses.service'

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

export { PAGE_SIZE }

export async function listExpensesForReview(
  reviewerRole: string,
  reviewerUserId: string,
  page: number,
  perPage: number
): Promise<ListReviewResult> {
  let expenses: Awaited<ReturnType<typeof listAllExpenses>>
  let total: number

  if (reviewerRole === 'RESPONSABLES') {
    const area = await getUserArea(reviewerUserId)
    if (!area) throw new Error('No tienes un área asignada en el sistema.')
    const userIds = await getUserIdsByArea(area)
    ;[expenses, total] = await Promise.all([
      listExpensesByUserIds(userIds, page, perPage),
      countExpensesByUserIds(userIds),
    ])
  } else {
    ;[expenses, total] = await Promise.all([listAllExpenses(page, perPage), countAllExpenses()])
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

const FINAL_STATUSES: TravelingExpenseStatus[] = ['APPROVED_BY_ADMIN', 'REJECTED']

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
    reviewerRole !== 'RESPONSABLES' &&
    expense.status !== 'APPROVED_BY_MANAGER'
  ) {
    throw new Error('El responsable del área debe aprobar el gasto antes de que administración pueda aprobarlo.')
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
