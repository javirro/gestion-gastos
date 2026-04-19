import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { apiSuccess, apiError } from "@/lib/api/response";
import { listUsers, createUser, PAGE_SIZE } from "@/server/users/users.service";
import { isValidRole } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";

const ALLOWED_ROLES = ["ADMINISTRACION", "DIRECTIVOS"];
const VALID_AREAS = ["ADMINISTRACION", "TECNOLOGIA", "RECURSOS_HUMANOS", "GESTION", "BIOLOGIA", "QUIMICA"];

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user || !user.role || !ALLOWED_ROLES.includes(user.role)) {
    return apiError({ status: 403, message: "No tienes permisos para ver los usuarios." });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("perPage") ?? String(PAGE_SIZE), 10)));

  try {
    const result = await listUsers(page, perPage);
    return apiSuccess({ status: 200, message: "Usuarios obtenidos correctamente.", data: result });
  } catch {
    return apiError({ status: 500, message: "Error al obtener usuarios." });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user || !user.role || !ALLOWED_ROLES.includes(user.role)) {
    return apiError({ status: 403, message: "No tienes permisos para crear usuarios." });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, message: "Cuerpo de la solicitud inválido." });
  }

  const { email, password, name, role, area } = body as Record<string, string>;

  if (!email || !password || !role || !area) {
    return apiError({ status: 400, message: "Email, contraseña, rol y área son obligatorios." });
  }

  if (!isValidRole(role)) {
    return apiError({ status: 400, message: "Rol inválido." });
  }

  if (!VALID_AREAS.includes(area)) {
    return apiError({ status: 400, message: "Área inválida." });
  }

  if (password.length < 8) {
    return apiError({ status: 400, message: "La contraseña debe tener al menos 8 caracteres." });
  }

  try {
    const newUser = await createUser({ email, password, name, role: role as AppRole, area });
    return apiSuccess({ status: 201, message: "Usuario creado correctamente.", data: newUser });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear el usuario.";
    return apiError({ status: 500, message });
  }
}
