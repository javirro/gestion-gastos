import { getAuthUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExpensesTable } from './expenses-table'
import { listUserExpenses, PAGE_SIZE } from '@/server/traveling-expenses/traveling-expenses.service'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function GastosPage({ searchParams }: Props) {
  const user = await getAuthUser()
  if (!user || !user.role) {
    redirect('/unauthorized')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  let result
  try {
    result = await listUserExpenses(user.id, page, PAGE_SIZE)
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
      <ExpensesTable
        expenses={expenses}
        page={page}
        totalPages={totalPages}
      />
    </div>
  )
}
