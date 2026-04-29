import { createAdminClient } from '@/lib/supabase/admin'
import { Role, Area } from '@/generated/prisma/client'
import {
  getRolesByUserIds,
  createUserRole,
  createUserProfile,
  getUserProfiles,
  updateUserProfile,
  replaceUserRole,
} from './users.repository'
import type { AppRole } from '@/lib/auth/roles'

export const PAGE_SIZE = 10

export interface UserDto {
  id: string
  email: string
  name: string | null
  role: string | null
  area: string | null
  createdAt: string
  lastSignIn: string | null
}

export interface ListUsersResult {
  users: UserDto[]
  page: number
  perPage: number
}

export interface CreateUserInput {
  email: string
  password: string
  name?: string
  role: AppRole
  area: string
}

export async function listUsers(page: number, perPage: number): Promise<ListUsersResult> {
  const supabase = createAdminClient()

  const {
    data: { users },
    error
  } = await supabase.auth.admin.listUsers({ page, perPage })
  if (error) throw new Error('Error al obtener usuarios de Supabase.')

  const userIds = users.map((u) => u.id)
  const [roles, profiles] = await Promise.all([
    getRolesByUserIds(userIds),
    getUserProfiles(userIds),
  ])
  const roleMap = new Map(roles.map((r) => [r.userId, r.role as string]))
  const profileMap = new Map(profiles.map((p) => [p.userId, p]))

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email ?? '',
      name: profileMap.get(u.id)?.name ?? null,
      role: roleMap.get(u.id) ?? null,
      area: profileMap.get(u.id)?.area ?? null,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null
    })),
    page,
    perPage
  }
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true
  })

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Error al crear el usuario en Supabase.')
  }

  const userId = data.user.id

  await Promise.all([createUserRole(userId, input.role as Role), createUserProfile(userId, { name: input.name, area: input.area as Area })])

  return {
    id: userId,
    email: input.email,
    role: input.role,
    name: input.name ?? null,
    area: input.area,
    createdAt: data.user.created_at,
    lastSignIn: null
  }
}

export interface UpdateUserInput {
  name?: string
  role: AppRole
  area: string
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<void> {
  await Promise.all([
    replaceUserRole(userId, input.role as Role),
    updateUserProfile(userId, { name: input.name, area: input.area as Area }),
  ])
}
