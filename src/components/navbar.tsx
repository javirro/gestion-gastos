import Link from 'next/link'
import { getAuthUser } from '@/lib/auth/get-user'
import { LogoutButton } from '@/components/logout-button'
import { NavLinks } from '@/components/nav-links'
import { MobileMenu } from '@/components/mobile-menu'
import { ADMIN_ROLES, REVIEW_ROLES } from '@/lib/auth/permissions'

export async function Navbar() {
  const user = await getAuthUser()
  const canSeeUsers = user?.role ? ADMIN_ROLES.includes(user.role) : false
  const canSeeReview = user?.role ? REVIEW_ROLES.includes(user.role) : false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Mobile: hamburger left */}
        <div className='flex items-center gap-2 sm:hidden'>
          <MobileMenu
            isLoggedIn={!!user}
            canSeeUsers={canSeeUsers}
            canSeeReview={canSeeReview}
            userEmail={user?.email}
          />
          <Link href='/' className='text-sm font-semibold tracking-tight text-primary'>
            Gestión de Gastos
          </Link>
        </div>

        {/* Desktop: logo + nav links */}
        <div className='hidden items-center gap-6 sm:flex'>
          <Link href='/' className='text-sm font-semibold tracking-tight text-primary'>
            Gestión de Gastos
          </Link>
          <NavLinks
            isLoggedIn={!!user}
            canSeeUsers={canSeeUsers}
            canSeeReview={canSeeReview}
          />
        </div>

        {/* Desktop: email + logout */}
        <div className="hidden items-center gap-3 sm:flex">
          {user?.email && (
            <span className="text-sm text-muted-foreground">{user.email}</span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
