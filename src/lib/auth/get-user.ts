import { createClient } from "@/lib/supabase/server";
import { getUserRole, type AppRole } from "./roles";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole | null;
}

/**
 * Get the authenticated user and their role from the server-side Supabase client.
 * Uses getClaims() to validate the JWT signature (safe for server use).
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) return null;

  const claims = data.claims;

  const role = getUserRole(claims as Record<string, unknown>);

  return {
    id: claims.sub as string,
    email: (claims.email as string) ?? "",
    role,
  };
}
