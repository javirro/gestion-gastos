import Link from 'next/link'
import { getAuthUser } from '@/lib/auth/get-user'
import { LogoutButton } from '@/components/logout-button'
import { NavLinks } from '@/components/nav-links'
import { ADMIN_ROLES, REVIEW_ROLES } from '@/lib/auth/permissions'

export async function Navbar() {
  const user = await getAuthUser()
  const canSeeUsers = user?.role ? ADMIN_ROLES.includes(user.role) : false
  const canSeeReview = user?.role ? REVIEW_ROLES.includes(user.role) : false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className='flex min-w-0 items-center gap-2 sm:gap-6'>
          <Link
            href='/'
            className='shrink-0 text-sm font-semibold tracking-tight text-primary'
          >
            Gestión de Gastos
          </Link>

          <NavLinks
            isLoggedIn={!!user}
            canSeeUsers={canSeeUsers}
            canSeeReview={canSeeReview}
          />
        </div>

        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user.email}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
