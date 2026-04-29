import { getAuthUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UsersTable } from './users-table'
import { listUsers, PAGE_SIZE } from '@/server/users/users.service'
import { buttonVariants } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { ADMIN_ROLES } from '@/lib/auth/permissions'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function UsuariosPage({ searchParams }: Props) {
  const user = await getAuthUser()
  if (!user || !user.role || !ADMIN_ROLES.includes(user.role)) {
    redirect('/unauthorized')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  let result
  try {
    result = await listUsers(page, PAGE_SIZE)
  } catch {
    return (
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <p className='text-destructive'>Error al cargar los usuarios.</p>
      </div>
    )
  }

  const { users: formattedUsers } = result
  const hasNextPage = formattedUsers.length === PAGE_SIZE

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold tracking-tight'>Usuarios</h1>
        <Link
          href='/admin/usuarios/nuevo'
          className={buttonVariants({ variant: 'default', size: 'sm' })}
        >
          <UserPlus className='mr-1.5 size-4' />
          Nuevo usuario
        </Link>
      </div>
      <UsersTable
        users={formattedUsers}
        page={page}
        hasNextPage={hasNextPage}
      />
    </div>
  )
}
