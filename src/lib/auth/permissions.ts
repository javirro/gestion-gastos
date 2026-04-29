import type { AppRole } from './roles'

export const ADMIN_ROLES: AppRole[] = ['ADMINISTRACION', 'DIRECTIVOS']
export const REVIEW_ROLES: AppRole[] = ['ADMINISTRACION', 'DIRECTIVOS', 'RESPONSABLES']

/**
 * Map of route patterns to allowed roles.
 * If a route is not listed, it is accessible to any authenticated user.
 * Public routes (login, unauthorized) are handled in proxy.ts before this check.
 */
const routePermissions: Record<string, AppRole[]> = {
  "/admin": ["ADMINISTRACION", "DIRECTIVOS"],
  "/directivos": ["DIRECTIVOS", "ADMINISTRACION"],
  "/responsables": ["RESPONSABLES", "ADMINISTRACION", "DIRECTIVOS"],
  "/ip": ["IP", "ADMINISTRACION"],
};

/**
 * Check if a role has access to a given pathname.
 * Returns true if the route has no restrictions or the role is in the allowed list.
 */
export function hasRouteAccess(pathname: string, role: AppRole | null): boolean {
  if (!role) return false;

  for (const [pattern, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname === pattern || pathname.startsWith(pattern + "/")) {
      return allowedRoles.includes(role);
    }
  }

  // Routes not in the map are accessible to any authenticated user with a valid role
  return true;
}
