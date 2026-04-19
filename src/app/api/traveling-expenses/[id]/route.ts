import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { apiSuccess, apiError } from '@/lib/api/response'
import { updateExpenseStatusService } from '@/server/traveling-expenses/traveling-expenses-review.service'

const ALLOWED_ROLES = ['ADMINISTRACION', 'DIRECTIVOS', 'RESPONSABLES']
const VALID_ACTIONS = ['APPROVE', 'REQUEST_CORRECTION', 'REJECT'] as const

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
