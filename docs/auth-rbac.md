# Autenticación y Control de Acceso por Roles (RBAC)

## Visión general

El sistema usa **Supabase Auth** para autenticación y un sistema propio de **RBAC** (Role-Based Access Control) para controlar qué páginas puede ver cada usuario según su rol.

El rol de cada usuario viaja dentro del **JWT** (token de sesión), por lo que cada petición lleva la información de permisos sin necesidad de consultar la base de datos en cada request.

---

## Roles disponibles

| Rol | Descripción |
|---|---|
| `ADMINISTRACION` | Acceso total, puede gestionar usuarios y roles |
| `DIRECTIVOS` | Acceso a vistas directivas y de responsables |
| `RESPONSABLES` | Acceso a su área y a vistas de empleados |
| `IP` | Acceso a su área específica |
| `EMPLEADO` | Acceso básico a la aplicación |

Los roles se asignan **manualmente desde el Dashboard de Supabase** insertando un registro en la tabla `user_roles`. No hay registro público.

---

## Flujo completo de autenticación

```
Usuario → /login → Supabase Auth
                        ↓
               Auth Hook ejecuta custom_access_token_hook
                        ↓
               Lee rol del usuario en tabla user_roles
                        ↓
               Inyecta { user_role: "ADMINISTRACION" } en el JWT
                        ↓
               JWT firmado se guarda en cookie del navegador
                        ↓
Petición → proxy.ts → getClaims() valida JWT y extrae user_role
                        ↓
               hasRouteAccess() comprueba si el rol puede acceder
                        ↓
          ✅ Acceso permitido   ó   🚫 Redirect a /unauthorized
```

---

## Estructura de archivos

```
src/
├── proxy.ts                        # Protección de rutas (se ejecuta en cada petición)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Cliente Supabase para componentes del navegador
│   │   ├── server.ts               # Cliente Supabase para Server Components
│   │   └── proxy.ts                # Refresca el token JWT via cookies
│   └── auth/
│       ├── roles.ts                # Enum AppRole y helpers para leer el rol del JWT
│       ├── permissions.ts          # Mapa de rutas → roles permitidos
│       └── get-user.ts             # Helper para obtener el usuario autenticado en el servidor
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Layout centrado para páginas de auth
│   │   └── login/page.tsx          # Página de login (email + contraseña)
│   └── unauthorized/page.tsx       # Página de acceso denegado
supabase/
└── migrations/
    └── 00001_rbac_setup.sql        # SQL a ejecutar en Supabase Dashboard
prisma/
└── schema.prisma                   # Modelo UserRole (espejo de la tabla user_roles)
```

---

## Base de datos

### Tabla `user_roles`

Creada por Prisma. Almacena el rol asignado a cada usuario.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | BIGINT | Clave primaria autoincremental |
| `user_id` | UUID | FK → `auth.users` (usuario de Supabase) |
| `role` | `app_role` | Enum con los 5 roles disponibles |
| `created_at` | TIMESTAMPTZ | Fecha de asignación |

> Restricción única en `(user_id, role)` — un usuario no puede tener el mismo rol dos veces.

### Enum `app_role`

```sql
CREATE TYPE "app_role" AS ENUM (
  'ADMINISTRACION', 'EMPLEADO', 'RESPONSABLES', 'IP', 'DIRECTIVOS'
);
```

---

## SQL de Supabase (`00001_rbac_setup.sql`)

Este archivo se ejecuta **una sola vez** en el SQL Editor de Supabase. Hace 4 cosas:

### 1. Foreign Key a `auth.users`
Prisma no puede referenciar el schema `auth` de Supabase (es interno). El SQL añade la FK manualmente para que al eliminar un usuario de Supabase se borre automáticamente su rol.

### 2. Row Level Security (RLS)
Activa RLS en la tabla `user_roles` para que los usuarios normales no puedan leer ni modificar roles de otros. Solo `supabase_auth_admin` (el sistema interno) puede leerla para el hook.

### 3. Auth Hook: `custom_access_token_hook`
Es una función PL/pgSQL que **Supabase ejecuta automáticamente cada vez que emite un JWT**. Lee el rol del usuario en `user_roles` y lo añade como campo `user_role` dentro del token:

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@empresa.com",
  "user_role": "ADMINISTRACION",
  ...
}
```

Así el rol viaja en el token y no hay que consultar la BD en cada petición.

> **Importante:** Después de ejecutar el SQL hay que activar el hook manualmente en:
> **Dashboard → Authentication → Hooks → Custom Access Token → seleccionar `custom_access_token_hook`**

### 4. Permisos y políticas RLS
- `supabase_auth_admin` recibe permisos para leer `user_roles` (necesario para el hook)
- Los usuarios `authenticated` no tienen acceso directo a la tabla (solo ADMINISTRACION con su política)

---

## Cómo usar en el código

### Proteger una ruta por rol

Edita `src/lib/auth/permissions.ts`:

```ts
const routePermissions: Record<string, AppRole[]> = {
  "/admin":        ["ADMINISTRACION"],
  "/directivos":   ["DIRECTIVOS", "ADMINISTRACION"],
  "/responsables": ["RESPONSABLES", "ADMINISTRACION", "DIRECTIVOS"],
  "/ip":           ["IP", "ADMINISTRACION"],
  // Añade aquí nuevas rutas protegidas
};
```

Las rutas no listadas son accesibles a cualquier usuario autenticado con un rol válido.

### Obtener el usuario en un Server Component

```ts
import { getAuthUser } from "@/lib/auth/get-user";

export default async function MiPagina() {
  const user = await getAuthUser();
  // user → { id, email, role } o null si no autenticado
}
```

### Obtener el usuario en un Client Component

```ts
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
// El rol está en session.access_token (JWT decodificado)
```

---

## Asignar un rol a un usuario

Desde el **SQL Editor de Supabase**:

```sql
INSERT INTO public."user_roles" (user_id, role)
VALUES ('<uuid-del-usuario>', 'ADMINISTRACION');
```

El UUID del usuario se obtiene en **Dashboard → Authentication → Users**.

> El cambio de rol no aplica hasta que el usuario vuelve a iniciar sesión (el JWT anterior sigue siendo válido hasta que expire).
