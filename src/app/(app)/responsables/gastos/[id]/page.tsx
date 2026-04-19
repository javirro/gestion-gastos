import { getAuthUser } from '@/lib/auth/get-user'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { getExpenseDetail } from '@/server/traveling-expenses/traveling-expenses-review.service'
import { ExpenseDetailHeader } from './expense-detail-header'
import { ExpenseItemsDetail } from './expense-items-detail'
import { ApproveActions } from '../approve-actions'

const ALLOWED_ROLES = ['ADMINISTRACION', 'DIRECTIVOS', 'RESPONSABLES']

interface Props {
  params: Promise<{ id: string }>
}

export default async function ExpenseDetailPage({ params }: Props) {
  const user = await getAuthUser()
  if (!user || !user.role || !ALLOWED_ROLES.includes(user.role)) {
    redirect('/unauthorized')
  }

  const { id } = await params

  let expense
  try {
    expense = await getExpenseDetail(id, user.id, user.role)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message === 'Gasto no encontrado.') notFound()
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-destructive">{message || 'Error al cargar el gasto.'}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/responsables/gastos"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <ChevronLeft className="mr-1 size-4" />
          Volver
        </Link>
        <ApproveActions expenseId={expense.id} status={expense.status} />
      </div>

      <div className="space-y-6">
        <ExpenseDetailHeader
          userName={expense.userName}
          userArea={expense.userArea}
          project={expense.project}
          description={expense.description}
          totalAmount={expense.totalAmount}
          isInternational={expense.isInternational}
          status={expense.status}
          correctionReason={expense.correctionReason}
          approvedByAdmin={expense.approvedByAdmin}
          createdAt={expense.createdAt}
        />
        <ExpenseItemsDetail items={expense.expenseItems} />
      </div>
    </div>
  )
}
