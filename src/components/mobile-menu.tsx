'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Receipt, ClipboardCheck, Users, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface MobileMenuProps {
  isLoggedIn: boolean
  canSeeUsers: boolean
  canSeeReview: boolean
  userEmail?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  match: string
}

export function MobileMenu({ isLoggedIn, canSeeUsers, canSeeReview, userEmail }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navItems: NavItem[] = []

  if (isLoggedIn) {
    navItems.push({ href: '/gastos', label: 'Mis gastos', icon: <Receipt className='size-5' />, match: '/gastos' })
  }
  if (canSeeReview) {
    navItems.push({ href: '/responsables/gastos', label: 'Revisión', icon: <ClipboardCheck className='size-5' />, match: '/responsables' })
  }
  if (canSeeUsers) {
    navItems.push({ href: '/admin/usuarios', label: 'Usuarios', icon: <Users className='size-5' />, match: '/admin' })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden'
        )}
        aria-label='Abrir menú'
      >
        {open ? <X className='size-5' /> : <Menu className='size-5' />}
      </SheetTrigger>

      <SheetContent side='left' showCloseButton={false} className='w-72 p-0'>
        {/* Header */}
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <span className='text-sm font-semibold tracking-tight text-primary'>Gestión de Gastos</span>
          <Button variant='ghost' size='icon' onClick={() => setOpen(false)} className='size-8'>
            <X className='size-4' />
          </Button>
        </div>

        {/* Nav items */}
        <nav className='flex flex-col gap-1 p-3'>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.match)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer with user info + logout */}
        {isLoggedIn && (
          <div className='mt-auto border-t p-3'>
            {userEmail && (
              <p className='mb-3 truncate px-3 text-xs text-muted-foreground'>{userEmail}</p>
            )}
            <Separator className='mb-3' />
            <button
              onClick={handleLogout}
              className='flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground'
            >
              <LogOut className='size-5' />
              Cerrar sesión
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
