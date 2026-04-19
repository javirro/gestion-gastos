import Link from "next/link"
import { Users } from "lucide-react"
import { getAuthUser } from "@/lib/auth/get-user"
import { LogoutButton } from "@/components/logout-button"

const ADMIN_ROLES = ["ADMINISTRACION", "DIRECTIVOS"]

export async function Navbar() {
  const user = await getAuthUser();
  const canSeeUsers = user?.role ? ADMIN_ROLES.includes(user.role) : false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-primary"
          >
            Gestión de Gastos
          </Link>

          <nav className="flex items-center gap-4">
            {canSeeUsers && (
              <Link
                href="/admin/usuarios"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Users className="size-4" />
                Usuarios
              </Link>
            )}
          </nav>
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
  );
}
