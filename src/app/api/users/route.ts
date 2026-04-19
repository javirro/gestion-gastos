import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { apiSuccess, apiError } from "@/lib/api/response";
import { listUsers, PAGE_SIZE } from "@/server/users/users.service";

const ALLOWED_ROLES = ["ADMINISTRACION", "DIRECTIVOS"];

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
