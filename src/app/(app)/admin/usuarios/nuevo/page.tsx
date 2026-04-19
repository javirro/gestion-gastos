import { getAuthUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { CreateUserForm } from './create-user-form'

const ALLOWED_ROLES = ['ADMINISTRACION', 'DIRECTIVOS']

export default async function NuevoUsuarioPage() {
  const user = await getAuthUser()
  if (!user || !user.role || !ALLOWED_ROLES.includes(user.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nuevo usuario</h1>
      <CreateUserForm />
    </div>
  )
}
