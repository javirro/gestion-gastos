import { getAuthUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { CreateExpenseForm } from './create-expense-form'

export default async function NuevoGastoPage() {
  const user = await getAuthUser()
  if (!user || !user.role) {
    redirect('/unauthorized')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nuevo gasto</h1>
      <CreateExpenseForm />
    </div>
  )
}
