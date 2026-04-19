import { createAdminClient } from "@/lib/supabase/admin";
import { getRolesByUserIds } from "./users.repository";

export const PAGE_SIZE = 10;

export interface UserDto {
  id: string;
  email: string;
  role: string | null;
  createdAt: string;
  lastSignIn: string | null;
}

export interface ListUsersResult {
  users: UserDto[];
  page: number;
  perPage: number;
}

export async function listUsers(page: number, perPage: number): Promise<ListUsersResult> {
  const supabase = createAdminClient();

  const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage });
  if (error) throw new Error("Error al obtener usuarios de Supabase.");

  const userIds = users.map((u) => u.id);
  const roles = await getRolesByUserIds(userIds);
  const roleMap = new Map(roles.map((r) => [r.userId, r.role as string]));

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: roleMap.get(u.id) ?? null,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
    })),
    page,
    perPage,
  };
}
