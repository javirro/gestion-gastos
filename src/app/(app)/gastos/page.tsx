import { getAuthUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ExpensesTable } from './expenses-table'
import { ExpenseFilters } from './expense-filters'
import { listUserExpenses, PAGE_SIZE } from '@/server/traveling-expenses/traveling-expenses.service'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; period?: string }>
}

export default async function GastosPage({ searchParams }: Props) {
  const user = await getAuthUser()
  if (!user || !user.role) {
    redirect('/unauthorized')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const VALID_STATUSES = ['PENDING', 'APPROVED_BY_MANAGER', 'APPROVED_BY_ADMIN', 'CORRECTION_REQUESTED', 'REJECTED']
  const status = VALID_STATUSES.includes(params.status ?? '') ? (params.status ?? '') : ''
  const period = /^\d{4}-\d{2}$/.test(params.period ?? '') ? (params.period ?? '') : ''

  let result
  try {
    result = await listUserExpenses(user.id, page, PAGE_SIZE, {
      status: status || undefined,
      period: period || undefined,
    })
  } catch {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-destructive">Error al cargar los gastos.</p>
      </div>
    )
  }

  const { expenses, total } = result
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Mis gastos</h1>
        <Link
          href="/gastos/nuevo"
          className={buttonVariants({ variant: 'default', size: 'sm' })}
        >
          <Plus className="mr-1.5 size-4" />
          Nuevo gasto
        </Link>
      </div>
      <div className="mb-4">
        <Suspense>
          <ExpenseFilters status={status} period={period} />
        </Suspense>
      </div>
      <ExpensesTable
        expenses={expenses}
        page={page}
        totalPages={totalPages}
        status={status || undefined}
        period={period || undefined}
      />
    </div>
  )
}
