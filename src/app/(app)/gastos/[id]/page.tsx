import { getAuthUser } from '@/lib/auth/get-user'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, Pencil } from 'lucide-react'
import { getOwnExpenseDetail } from '@/server/traveling-expenses/traveling-expenses.service'
import { ExpenseDetailHeader } from '../../responsables/gastos/[id]/expense-detail-header'
import { ExpenseItemsDetail } from '../../responsables/gastos/[id]/expense-items-detail'

const EDITABLE_STATUSES = ['PENDING', 'CORRECTION_REQUESTED']

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserExpenseDetailPage({ params }: Props) {
  const user = await getAuthUser()
  if (!user || !user.role) {
    redirect('/unauthorized')
  }

  const { id } = await params

  let expense
  try {
    expense = await getOwnExpenseDetail(id, user.id)
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
          href="/gastos"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <ChevronLeft className="mr-1 size-4" />
          Volver a mis gastos
        </Link>
        {EDITABLE_STATUSES.includes(expense.status) && (
          <Link
            href={`/gastos/${expense.id}/editar`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Pencil className="mr-1.5 size-4" />
            Editar
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <ExpenseDetailHeader
          userName={null}
          userArea=""
          project={expense.project}
          description={expense.description}
          totalAmount={expense.totalAmount}
          isInternational={expense.isInternational}
          status={expense.status}
          correctionReason={expense.correctionReason}
          approvedByAdmin={false}
          createdAt={expense.createdAt}
        />
        <ExpenseItemsDetail items={expense.expenseItems} />
      </div>
    </div>
  )
}
