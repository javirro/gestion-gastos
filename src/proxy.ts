import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { getUserRole } from "@/lib/auth/roles";
import { hasRouteAccess } from "@/lib/auth/permissions";

const PUBLIC_ROUTES = ["/login", "/unauthorized"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always refresh the session (handles cookie sync)
  const { supabaseResponse, claims, error } = await updateSession(request);

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // Not authenticated → redirect to login
  if (error || !claims) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return Response.redirect(loginUrl);
  }

  // Check role-based route access
  const role = getUserRole(claims as Record<string, unknown>);

  if (!hasRouteAccess(pathname, role)) {
    const unauthorizedUrl = request.nextUrl.clone();
    unauthorizedUrl.pathname = "/unauthorized";
    return Response.redirect(unauthorizedUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
