-- Migration: canonical parish relation + role-aware RLS policies (PostgreSQL/Supabase)

-- 1) Ensure user role and parish linkage columns exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role text DEFAULT 'parish';
  END IF;
END $$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS parish_id integer;

-- 2) Ensure households has canonical parish_id reference.
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS parish_id integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'households_parish_id_fkey'
      AND conrelid = 'public.households'::regclass
  ) THEN
    ALTER TABLE public.households
      ADD CONSTRAINT households_parish_id_fkey
      FOREIGN KEY (parish_id) REFERENCES public.parishes(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_parish_id_fkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_parish_id_fkey
      FOREIGN KEY (parish_id) REFERENCES public.parishes(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_households_parish_id ON public.households(parish_id);
CREATE INDEX IF NOT EXISTS idx_users_parish_id ON public.users(parish_id);

-- 3) Deterministic backfill: match existing household/user parish text to canonical parishes.
UPDATE public.households h
SET parish_id = p.id
FROM public.parishes p
WHERE h.parish_id IS NULL
  AND h.parish_name IS NOT NULL
  AND trim(h.parish_name) <> ''
  AND lower(trim(h.parish_name)) = lower(trim(p.name));

UPDATE public.users u
SET parish_id = p.id
FROM public.parishes p
WHERE u.parish_id IS NULL
  AND lower(trim(u.username)) = lower(trim(p.name));

-- 4) Keep legacy cleanup.
ALTER TABLE public.socio_economic DROP COLUMN IF EXISTS organizations;
ALTER TABLE public.socio_economic DROP COLUMN IF EXISTS organizations_others_text;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS organization_code text;

-- 5) Security helpers for JWT-based role and parish checks.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'app_role',
    auth.jwt() -> 'app_metadata' ->> 'app_role',
    auth.jwt() ->> 'role',
    'parish'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_app_parish_id()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(COALESCE(
    auth.jwt() ->> 'parish_id',
    auth.jwt() -> 'app_metadata' ->> 'parish_id'
  ), '')::integer;
$$;

-- 6) Remove permissive/legacy policies and replace with scoped policies.
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('households', 'family_members', 'health_conditions', 'socio_economic', 'users')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socio_economic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY households_select_scoped
ON public.households
FOR SELECT
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR parish_id = public.current_app_parish_id()
);

CREATE POLICY households_insert_scoped
ON public.households
FOR INSERT
WITH CHECK (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR parish_id = public.current_app_parish_id()
);

CREATE POLICY households_update_scoped
ON public.households
FOR UPDATE
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR parish_id = public.current_app_parish_id()
)
WITH CHECK (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR parish_id = public.current_app_parish_id()
);

CREATE POLICY households_delete_admin
ON public.households
FOR DELETE
USING (public.current_app_role() IN ('admin', 'archdiocese'));

CREATE POLICY family_members_select_scoped
ON public.family_members
FOR SELECT
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = family_members.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
);

CREATE POLICY family_members_write_scoped
ON public.family_members
FOR ALL
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = family_members.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
)
WITH CHECK (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = family_members.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
);

CREATE POLICY health_conditions_select_scoped
ON public.health_conditions
FOR SELECT
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = health_conditions.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
);

CREATE POLICY health_conditions_write_scoped
ON public.health_conditions
FOR ALL
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = health_conditions.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
)
WITH CHECK (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = health_conditions.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
);

CREATE POLICY socio_economic_select_scoped
ON public.socio_economic
FOR SELECT
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = socio_economic.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
);

CREATE POLICY socio_economic_write_scoped
ON public.socio_economic
FOR ALL
USING (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = socio_economic.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
)
WITH CHECK (
  public.current_app_role() IN ('admin', 'archdiocese')
  OR EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.household_id = socio_economic.household_id
      AND h.parish_id = public.current_app_parish_id()
  )
);

CREATE POLICY users_admin_only
ON public.users
FOR ALL
USING (public.current_app_role() = 'admin')
WITH CHECK (public.current_app_role() = 'admin');
