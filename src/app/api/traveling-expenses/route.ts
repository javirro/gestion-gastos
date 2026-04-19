import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { apiSuccess, apiError } from '@/lib/api/response'
import {
  createExpense,
  listUserExpenses,
  PAGE_SIZE,
} from '@/server/traveling-expenses/traveling-expenses.service'
import type { ExpenseCategory } from '@/generated/prisma/client'

const VALID_CATEGORIES: ExpenseCategory[] = [
  'TRANSPORTE',
  'DIETAS',
  'COMISIONES',
  'COMBUSTIBLE',
]

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user || !user.role) {
    return apiError({ status: 403, message: 'No tienes permisos.' })
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get('perPage') ?? String(PAGE_SIZE), 10))
  )

  try {
    const result = await listUserExpenses(user.id, page, perPage)
    return apiSuccess({
      status: 200,
      message: 'Gastos obtenidos correctamente.',
      data: result,
    })
  } catch {
    return apiError({ status: 500, message: 'Error al obtener los gastos.' })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user || !user.role) {
    return apiError({ status: 403, message: 'No tienes permisos.' })
  }

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
    project?: string
    description?: string
    isInternational?: boolean
    items?: {
      date?: string
      category?: string
      amount?: number
      startingLocation?: string
      destination?: string
      description?: string
    }[]
  }

  try {
    metadata = JSON.parse(metadataRaw)
  } catch {
    return apiError({ status: 400, message: 'Metadata inválido.' })
  }

  if (!metadata.items || !Array.isArray(metadata.items) || metadata.items.length === 0) {
    return apiError({ status: 400, message: 'Debe incluir al menos un gasto.' })
  }

  for (let i = 0; i < metadata.items.length; i++) {
    const item = metadata.items[i]
    if (!item.date || !item.category || item.amount == null) {
      return apiError({
        status: 400,
        message: `El gasto #${i + 1} requiere fecha, categoría e importe.`,
      })
    }
    if (!VALID_CATEGORIES.includes(item.category as ExpenseCategory)) {
      return apiError({
        status: 400,
        message: `Categoría inválida en el gasto #${i + 1}.`,
      })
    }
    if (Number(item.amount) <= 0) {
      return apiError({
        status: 400,
        message: `El importe del gasto #${i + 1} debe ser mayor que 0.`,
      })
    }
  }

  const files = new Map<number, File>()
  for (let i = 0; i < metadata.items.length; i++) {
    const file = formData.get(`ticket_${i}`)
    if (file && file instanceof File && file.size > 0) {
      files.set(i, file)
    }
  }

  try {
    const expense = await createExpense(
      user.id,
      {
        project: metadata.project,
        description: metadata.description,
        isInternational: metadata.isInternational ?? false,
        items: metadata.items.map((item) => ({
          date: item.date!,
          category: item.category as ExpenseCategory,
          amount: Number(item.amount),
          startingLocation: item.startingLocation,
          destination: item.destination,
          description: item.description,
        })),
      },
      files
    )

    return apiSuccess({
      status: 201,
      message: 'Gasto creado correctamente.',
      data: expense,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear el gasto.'
    return apiError({ status: 500, message })
  }
}
