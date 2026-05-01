'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Receipt, ClipboardCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLinksProps {
  isLoggedIn: boolean
  canSeeUsers: boolean
  canSeeReview: boolean
}

export function NavLinks({ isLoggedIn, canSeeUsers, canSeeReview }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <nav className='flex items-center gap-1 sm:gap-4'>
      {isLoggedIn && (
        <Link
          href='/gastos'
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            pathname.startsWith('/gastos')
              ? 'font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Receipt className='size-4' />
          <span className='hidden sm:inline'>Gastos</span>
        </Link>
      )}
      {canSeeReview && (
        <Link
          href='/responsables/gastos'
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            pathname.startsWith('/responsables')
              ? 'font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ClipboardCheck className='size-4' />
          <span className='hidden sm:inline'>Revisión</span>
        </Link>
      )}
      {canSeeUsers && (
        <Link
          href='/admin/usuarios'
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            pathname.startsWith('/admin')
              ? 'font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className='size-4' />
          <span className='hidden sm:inline'>Usuarios</span>
        </Link>
      )}
    </nav>
  )
}
