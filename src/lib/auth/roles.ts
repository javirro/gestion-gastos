export const APP_ROLES = [
  "ADMINISTRACION",
  "EMPLEADO",
  "RESPONSABLES",
  "IP",
  "DIRECTIVOS",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function isValidRole(role: unknown): role is AppRole {
  return typeof role === "string" && APP_ROLES.includes(role as AppRole);
}

export function getUserRole(claims: Record<string, unknown>): AppRole | null {
  const role = claims?.user_role;
  return isValidRole(role) ? role : null;
}
