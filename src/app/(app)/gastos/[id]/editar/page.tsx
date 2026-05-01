import { getAuthUser } from '@/lib/auth/get-user'
import { redirect, notFound } from 'next/navigation'
import { getOwnExpenseDetail } from '@/server/traveling-expenses/traveling-expenses.service'
import { EditExpenseForm } from './edit-expense-form'

const EDITABLE_STATUSES = ['PENDING', 'CORRECTION_REQUESTED']

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: Props) {
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

  if (!EDITABLE_STATUSES.includes(expense.status)) {
    redirect(`/gastos/${id}`)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Editar gasto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifica los datos del gasto. Se restablecerá a estado pendiente.
        </p>
      </div>
      <EditExpenseForm
        expenseId={expense.id}
        initialProject={expense.project ?? ''}
        initialPeriod={expense.period ?? ''}
        initialDescription={expense.description ?? ''}
        initialItems={expense.expenseItems}
      />
    </div>
  )
}
