import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { apiSuccess, apiError } from '@/lib/api/response'
import { updateExpenseStatusService } from '@/server/traveling-expenses/traveling-expenses-review.service'
import { editExpense } from '@/server/traveling-expenses/traveling-expenses.service'
import type { ExpenseCategory } from '@/generated/prisma/client'

const ALLOWED_ROLES = ['ADMINISTRACION', 'DIRECTIVOS', 'RESPONSABLES']
const VALID_ACTIONS = ['APPROVE', 'REQUEST_CORRECTION', 'REJECT'] as const
const VALID_CATEGORIES: ExpenseCategory[] = ['TRANSPORTE', 'DIETAS', 'COMISIONES', 'COMBUSTIBLE']

type ValidAction = (typeof VALID_ACTIONS)[number]

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser()
  if (!user || !user.role || !ALLOWED_ROLES.includes(user.role)) {
    return apiError({ status: 403, message: 'No tienes permisos para revisar gastos.' })
  }

  const { id } = await params

  if (!id) {
    return apiError({ status: 400, message: 'ID de gasto requerido.' })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return apiError({ status: 400, message: 'Cuerpo de la solicitud inválido.' })
  }

  const { action, correctionReason } = body as { action?: string; correctionReason?: string }

  if (!action || !VALID_ACTIONS.includes(action as ValidAction)) {
    return apiError({ status: 400, message: 'Acción inválida. Usa: APPROVE, REQUEST_CORRECTION o REJECT.' })
  }

  if (action === 'REQUEST_CORRECTION' && !correctionReason) {
    return apiError({ status: 400, message: 'Debes proporcionar un motivo de corrección.' })
  }

  try {
    await updateExpenseStatusService(
      id,
      user.id,
      user.role,
      action as ValidAction,
      correctionReason
    )
    return apiSuccess({ status: 200, message: 'Estado del gasto actualizado correctamente.' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar el gasto.'
    return apiError({ status: 500, message })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser()
  if (!user || !user.role) {
    return apiError({ status: 403, message: 'No tienes permisos.' })
  }

  const { id } = await params
  if (!id) return apiError({ status: 400, message: 'ID de gasto requerido.' })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return apiError({ status: 400, message: 'Cuerpo de la solicitud inválido.' })
  }

  const metadataRaw = formData.get('metadata')
  if (!metadataRaw || typeof metadataRaw !== 'string') {
    return apiError({ status: 400, message: 'Falta el campo metadata.' })
  }

  let metadata: {
    project?: string; description?: string; isInternational?: boolean
    items?: { date?: string; category?: string; amount?: number; startingLocation?: string; destination?: string; description?: string; existingTicketUrl?: string }[]
  }
  try {
    metadata = JSON.parse(metadataRaw)
  } catch {
    return apiError({ status: 400, message: 'El campo metadata no es JSON válido.' })
  }

  const { items } = metadata
  if (!Array.isArray(items) || items.length === 0) {
    return apiError({ status: 400, message: 'Debes incluir al menos un gasto.' })
  }

  for (const item of items) {
    if (!item.date || !item.category || !item.amount || item.amount <= 0) {
      return apiError({ status: 400, message: 'Cada gasto requiere fecha, categoría e importe.' })
    }
    if (!VALID_CATEGORIES.includes(item.category as ExpenseCategory)) {
      return apiError({ status: 400, message: `Categoría inválida: ${item.category}` })
    }
  }

  const files = new Map<number, File>()
  items.forEach((_, index) => {
    const file = formData.get(`ticket_${index}`)
    if (file instanceof File) files.set(index, file)
  })

  try {
    await editExpense(id, user.id, {
      project: metadata.project,
      description: metadata.description,
      isInternational: metadata.isInternational ?? false,
      items: items.map((item) => ({
        date: item.date!,
        category: item.category!,
        amount: item.amount!,
        startingLocation: item.startingLocation,
        destination: item.destination,
        description: item.description,
        existingTicketUrl: item.existingTicketUrl,
      })),
    }, files)
    return apiSuccess({ status: 200, message: 'Gasto actualizado correctamente.' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar el gasto.'
    return apiError({ status: 500, message })
  }
}
