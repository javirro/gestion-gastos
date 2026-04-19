-- =============================================================
-- Supabase RBAC Setup: Auth Hook + RLS + Permissions
-- The enum "app_role" and table "user_roles" already exist
-- (created by Prisma migration).
-- Execute this in Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Add FK to auth.users (Prisma can't reference auth schema)
ALTER TABLE public."user_roles"
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users ON DELETE CASCADE;

COMMENT ON TABLE public."user_roles" IS 'Application roles assigned to each user.';

-- 2. Enable RLS on user_roles
ALTER TABLE public."user_roles" ENABLE ROW LEVEL SECURITY;

-- 3. Create the Auth Hook function (Custom Access Token)
--    This injects "user_role" into the JWT claims
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $function$
DECLARE
  claims     JSONB;
  found_role TEXT;
BEGIN
  found_role := (
    SELECT r.role::TEXT
    FROM public."user_roles" r
    WHERE r.user_id = (event->>'user_id')::UUID
    LIMIT 1
  );

  claims := event->'claims';

  IF found_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(found_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb);
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$function$;

-- 4. Grant permissions to supabase_auth_admin (required for the hook)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

GRANT EXECUTE
  ON FUNCTION public.custom_access_token_hook
  TO supabase_auth_admin;

REVOKE EXECUTE
  ON FUNCTION public.custom_access_token_hook
  FROM authenticated, anon, public;

GRANT ALL
  ON TABLE public."user_roles"
  TO supabase_auth_admin;

REVOKE ALL
  ON TABLE public."user_roles"
  FROM authenticated, anon, public;

-- 5. RLS policy: allow auth admin to read user roles (needed by the hook)
CREATE POLICY "Allow auth admin to read user roles"
  ON public."user_roles"
  AS PERMISSIVE
  FOR SELECT
  TO supabase_auth_admin
  USING (true);

-- 6. RLS policy: allow admins (ADMINISTRACION) to manage roles
--    Uses a subquery to check the current user's role
CREATE POLICY "Allow ADMINISTRACION to manage user roles"
  ON public."user_roles"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."user_roles"
      WHERE user_id = auth.uid()
        AND role = 'ADMINISTRACION'
    )
  );

-- =============================================================
-- IMPORTANT: After running this SQL, go to:
-- Dashboard > Authentication > Hooks > Custom Access Token
-- Select the function: public.custom_access_token_hook
-- Click "Enable Hook"
-- =============================================================
