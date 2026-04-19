import { getAuthUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { UsersTable } from "./users-table";
import { listUsers, PAGE_SIZE } from "@/server/users/users.service";

const ALLOWED_ROLES = ["ADMINISTRACION", "DIRECTIVOS"];

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function UsuariosPage({ searchParams }: Props) {
  const user = await getAuthUser();
  if (!user || !user.role || !ALLOWED_ROLES.includes(user.role)) {
    redirect("/unauthorized");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  let result;
  try {
    result = await listUsers(page, PAGE_SIZE);
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-destructive">Error al cargar los usuarios.</p>
      </div>
    );
  }

  const { users: formattedUsers } = result;
  const hasNextPage = formattedUsers.length === PAGE_SIZE;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Usuarios</h1>
      <UsersTable
        users={formattedUsers}
        page={page}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
