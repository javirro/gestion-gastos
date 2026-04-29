'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EditUserDialog } from './edit-user-dialog'

interface User {
  id: string
  email: string
  name: string | null
  role: string | null
  area: string | null
  createdAt: string
  lastSignIn: string | null
}

interface UsersTableProps {
  users: User[]
  page: number
  hasNextPage: boolean
}

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  ADMINISTRACION: 'default',
  DIRECTIVOS: 'secondary',
  RESPONSABLES: 'secondary',
  IP: 'outline',
  EMPLEADO: 'outline',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function UsersTable({ users, page, hasNextPage }: UsersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    startTransition(() => router.refresh())
  }

  return (
    <div className={`space-y-4 transition-opacity duration-200${isPending ? ' pointer-events-none opacity-60' : ''}`}>
      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className='hidden md:table-cell'>Creado</TableHead>
              <TableHead className='hidden md:table-cell'>Último acceso</TableHead>
              <TableHead className='w-16'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground'>
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant={ROLE_VARIANT[user.role] ?? 'outline'}>
                        {user.role}
                      </Badge>
                    ) : (
                      <span className='text-sm text-muted-foreground'>Sin rol</span>
                    )}
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className='hidden md:table-cell'>{formatDate(user.lastSignIn)}</TableCell>
                  <TableCell>
                    <EditUserDialog user={user} onSuccess={handleRefresh} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>Página {page}</p>
        <div className='flex gap-2'>
          {page > 1 ? (
            <Link
              href={`/admin/usuarios?page=${page - 1}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <ChevronLeft className='mr-1 size-4' />
              Anterior
            </Link>
          ) : (
            <span
              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}
            >
              <ChevronLeft className='mr-1 size-4' />
              Anterior
            </span>
          )}
          {hasNextPage ? (
            <Link
              href={`/admin/usuarios?page=${page + 1}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Siguiente
              <ChevronRight className='ml-1 size-4' />
            </Link>
          ) : (
            <span
              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}
            >
              Siguiente
              <ChevronRight className='ml-1 size-4' />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
