import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { apiSuccess, apiError } from '@/lib/api/response'
import { addComment } from '@/server/traveling-expenses/traveling-expenses.service'
import { getUsersByIds } from '@/server/traveling-expenses/traveling-expenses.repository'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser()
  if (!user || !user.role) {
    return apiError({ status: 403, message: 'No tienes permisos.' })
  }

  const { id } = await params
  if (!id) return apiError({ status: 400, message: 'ID de gasto requerido.' })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return apiError({ status: 400, message: 'Cuerpo de la solicitud inválido.' })
  }

  const { message } = body as { message?: string }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return apiError({ status: 400, message: 'El mensaje no puede estar vacío.' })
  }

  if (message.length > 1000) {
    return apiError({ status: 400, message: 'El mensaje no puede superar los 1000 caracteres.' })
  }

  const users = await getUsersByIds([user.id])
  const userName = users[0]?.name ?? undefined

  try {
    const comment = await addComment(id, user.id, userName, message.trim())
    return apiSuccess({ status: 201, message: 'Comentario añadido correctamente.', data: comment })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al añadir el comentario.'
    return apiError({ status: 500, message: msg })
  }
}
