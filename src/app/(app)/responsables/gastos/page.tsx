import { getAuthUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { listExpensesForReview, PAGE_SIZE } from '@/server/traveling-expenses/traveling-expenses-review.service'
import { ReviewExpensesTable } from './review-expenses-table'
import { REVIEW_ROLES } from '@/lib/auth/permissions'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function RevisionGastosPage({ searchParams }: Props) {
  const user = await getAuthUser()
  if (!user || !user.role || !REVIEW_ROLES.includes(user.role)) {
    redirect('/unauthorized')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  let result
  try {
    result = await listExpensesForReview(user.role, user.id, page, PAGE_SIZE)
  } catch (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-destructive">
          {err instanceof Error ? err.message : 'Error al cargar los gastos.'}
        </p>
      </div>
    )
  }

  const { expenses, total } = result
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Revisión de gastos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.role === 'RESPONSABLES'
            ? 'Gastos de desplazamiento de tu área.'
            : 'Todos los gastos de desplazamiento.'}
        </p>
      </div>
      <ReviewExpensesTable expenses={expenses} page={page} totalPages={totalPages} />
    </div>
  )
}
