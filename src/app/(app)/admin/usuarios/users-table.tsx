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
import { VALID_AREAS } from '@/lib/auth/areas'
import { APP_ROLES } from '@/lib/auth/roles'

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
  total?: number
  area: string
  role: string
}

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  ADMINISTRACION: 'default',
  DIRECTIVOS: 'secondary',
  RESPONSABLES: 'secondary',
  IP: 'outline',
  EMPLEADO: 'outline',
}

const AREA_LABEL: Record<string, string> = {
  ADMINISTRACION: 'Administración',
  TECNOLOGIA: 'Tecnología',
  RECURSOS_HUMANOS: 'RRHH',
  GESTION: 'Gestión',
  BIOLOGIA: 'Biología',
  QUIMICA: 'Química',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildUrl(newPage: number, area: string, role: string) {
  const params = new URLSearchParams()
  params.set('page', String(newPage))
  if (area) params.set('area', area)
  if (role) params.set('role', role)
  return `/admin/usuarios?${params.toString()}`
}

export function UsersTable({ users, page, hasNextPage, total, area, role }: UsersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    startTransition(() => router.refresh())
  }

  function handleAreaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams()
    params.set('page', '1')
    if (e.target.value) params.set('area', e.target.value)
    if (role) params.set('role', role)
    router.push(`/admin/usuarios?${params.toString()}`)
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams()
    params.set('page', '1')
    if (area) params.set('area', area)
    if (e.target.value) params.set('role', e.target.value)
    router.push(`/admin/usuarios?${params.toString()}`)
  }

  const selectClass =
    'h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div className={`space-y-4 transition-opacity duration-200${isPending ? ' pointer-events-none opacity-60' : ''}`}>
      <div className='flex flex-wrap items-center gap-2'>
        <select value={area} onChange={handleAreaChange} className={selectClass}>
          <option value=''>Todas las áreas</option>
          {VALID_AREAS.map((a) => (
            <option key={a} value={a}>{AREA_LABEL[a] ?? a}</option>
          ))}
        </select>

        <select value={role} onChange={handleRoleChange} className={selectClass}>
          <option value=''>Todos los roles</option>
          {APP_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {(area || role) && (
          <Link
            href='/admin/usuarios?page=1'
            className='text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground'
          >
            Limpiar filtros
          </Link>
        )}
      </div>

      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className='hidden sm:table-cell'>Área</TableHead>
              <TableHead className='hidden md:table-cell'>Creado</TableHead>
              <TableHead className='hidden md:table-cell'>Último acceso</TableHead>
              <TableHead className='w-16'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center text-muted-foreground'>
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
                  <TableCell className='hidden sm:table-cell'>
                    {user.area ? (
                      <span className='text-sm'>{AREA_LABEL[user.area] ?? user.area}</span>
                    ) : (
                      <span className='text-sm text-muted-foreground'>—</span>
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
        <p className='text-sm text-muted-foreground'>
          {total !== undefined ? `${total} usuario${total !== 1 ? 's' : ''}` : `Página ${page}`}
        </p>
        <div className='flex gap-2'>
          {page > 1 ? (
            <Link
              href={buildUrl(page - 1, area, role)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <ChevronLeft className='mr-1 size-4' />
              Anterior
            </Link>
          ) : (
            <span className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}>
              <ChevronLeft className='mr-1 size-4' />
              Anterior
            </span>
          )}
          {hasNextPage ? (
            <Link
              href={buildUrl(page + 1, area, role)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Siguiente
              <ChevronRight className='ml-1 size-4' />
            </Link>
          ) : (
            <span className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}>
              Siguiente
              <ChevronRight className='ml-1 size-4' />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
