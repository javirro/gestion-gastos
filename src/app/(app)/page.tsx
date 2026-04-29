import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/get-user'

export default async function Home() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  switch (user.role) {
    case 'ADMINISTRACION':
    case 'DIRECTIVOS':
      redirect('/admin/usuarios')
    case 'RESPONSABLES':
      redirect('/responsables/gastos')
    case 'IP':
    case 'EMPLEADO':
    default:
      redirect('/gastos')
  }
}
