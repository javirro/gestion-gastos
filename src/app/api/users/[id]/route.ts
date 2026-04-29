import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { apiSuccess, apiError } from '@/lib/api/response'
import { updateUser } from '@/server/users/users.service'
import { isValidRole } from '@/lib/auth/roles'
import { ADMIN_ROLES } from '@/lib/auth/permissions'
import { VALID_AREAS } from '@/lib/auth/areas'
import type { AppRole } from '@/lib/auth/roles'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser()
  if (!user || !user.role || !ADMIN_ROLES.includes(user.role)) {
    return apiError({ status: 403, message: 'No tienes permisos para editar usuarios.' })
  }

  const { id } = await params

  if (!id) {
    return apiError({ status: 400, message: 'ID de usuario requerido.' })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return apiError({ status: 400, message: 'Cuerpo de la solicitud inválido.' })
  }

  const { name, role, area } = body as Record<string, string>

  if (!role || !area) {
    return apiError({ status: 400, message: 'Rol y área son obligatorios.' })
  }

  if (!isValidRole(role)) {
    return apiError({ status: 400, message: 'Rol inválido.' })
  }

  if (!VALID_AREAS.includes(area as typeof VALID_AREAS[number])) {
    return apiError({ status: 400, message: 'Área inválida.' })
  }

  try {
    await updateUser(id, { name: name || undefined, role: role as AppRole, area })
    return apiSuccess({ status: 200, message: 'Usuario actualizado correctamente.' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar el usuario.'
    return apiError({ status: 500, message })
  }
}
