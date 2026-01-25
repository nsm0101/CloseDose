-- Ensure every signed-in user has an active family and at least one member
CREATE OR REPLACE FUNCTION public.ensure_active_family_for_current_user()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user uuid := auth.uid();
  family_id uuid;
  member_name text;
BEGIN
  IF current_user IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT uf.family_id
  INTO family_id
  FROM public.user_families uf
  WHERE uf.user_id = current_user
  ORDER BY uf.created_at ASC
  LIMIT 1;

  IF family_id IS NULL THEN
    INSERT INTO public.families (name, created_by_user_id)
    VALUES ('My Family', current_user)
    RETURNING id INTO family_id;
  END IF;

  IF family_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.family_members fm
    WHERE fm.family_id = family_id
  ) THEN
    SELECT NULLIF((current_setting('request.jwt.claims', true)::jsonb ->> 'email'), '')
    INTO member_name;
    member_name := COALESCE(member_name, 'Primary Member');

    INSERT INTO public.family_members (family_id, name, created_by_user_id)
    VALUES (family_id, member_name, current_user);
  END IF;

  RETURN family_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_active_family_for_current_user() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_active_family_for_current_user() FROM anon, PUBLIC;
