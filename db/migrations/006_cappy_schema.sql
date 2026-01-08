-- Cappy profile, family member, and dosing log schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  family_name text,
  member_profiles jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families (id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  age text,
  weight text,
  med text,
  medications text[] DEFAULT '{}'::text[],
  notes text,
  color text,
  date_of_birth date,
  dob date,
  sex text,
  weight_kg numeric,
  photo_url text,
  created_by_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (family_id, name)
);

ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS dob date,
  ADD COLUMN IF NOT EXISTS sex text,
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

UPDATE public.family_members
SET dob = COALESCE(dob, date_of_birth)
WHERE dob IS NULL
  AND date_of_birth IS NOT NULL;

UPDATE public.family_members
SET weight_kg = COALESCE(weight_kg, NULLIF(weight, '')::numeric)
WHERE weight_kg IS NULL
  AND weight ~ E'^[0-9]+(\\.[0-9]+)?$';

CREATE TABLE IF NOT EXISTS public.weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id uuid NOT NULL REFERENCES public.family_members (id) ON DELETE CASCADE,
  weight_kg numeric NOT NULL,
  measured_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dose_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families (id) ON DELETE CASCADE,
  family_member_id uuid NOT NULL REFERENCES public.family_members (id) ON DELETE CASCADE,
  medication_code text,
  medication_label text,
  dose_amount numeric,
  dose_unit text,
  administered_at timestamptz DEFAULT now(),
  created_by_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.otc_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  brand_name text,
  generic_name text,
  form text,
  concentration_label text,
  category text,
  brand_logo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_members_family_id_idx ON public.family_members (family_id);
CREATE INDEX IF NOT EXISTS weight_logs_member_id_idx ON public.weight_logs (family_member_id);
CREATE INDEX IF NOT EXISTS dose_logs_member_id_idx ON public.dose_logs (family_member_id);
CREATE INDEX IF NOT EXISTS dose_logs_family_id_idx ON public.dose_logs (family_id);
CREATE INDEX IF NOT EXISTS dose_logs_medication_code_idx ON public.dose_logs (medication_code);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otc_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS profiles_self_select
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY IF NOT EXISTS profiles_self_insert
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY IF NOT EXISTS profiles_self_update
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY IF NOT EXISTS family_members_family_access
  ON public.family_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS family_members_family_modify
  ON public.family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS weight_logs_family_access
  ON public.weight_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_members fm
      JOIN public.user_families uf ON uf.family_id = fm.family_id
      WHERE fm.id = family_member_id
        AND uf.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS weight_logs_family_modify
  ON public.weight_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_members fm
      JOIN public.user_families uf ON uf.family_id = fm.family_id
      WHERE fm.id = family_member_id
        AND uf.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.family_members fm
      JOIN public.user_families uf ON uf.family_id = fm.family_id
      WHERE fm.id = family_member_id
        AND uf.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS dose_logs_family_access
  ON public.dose_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS dose_logs_family_modify
  ON public.dose_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS otc_medications_public_select
  ON public.otc_medications
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON public.profiles;
CREATE TRIGGER profiles_touch_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS family_members_touch_updated_at ON public.family_members;
CREATE TRIGGER family_members_touch_updated_at
BEFORE UPDATE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, family_name, member_profiles)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'family_name', 'The CloseDose Household'), '[]'::jsonb)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auth_users_after_insert_profiles ON auth.users;
CREATE TRIGGER auth_users_after_insert_profiles
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
