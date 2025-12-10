-- Trigger to add family creator as admin in user_families
CREATE OR REPLACE FUNCTION public.add_family_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator uuid := NEW.created_by_user_id;
BEGIN
  IF creator IS NULL THEN
    creator := auth.uid();
  END IF;

  IF creator IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_families (user_id, family_id, role)
  SELECT creator, NEW.id, 'admin'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_families uf
    WHERE uf.user_id = creator
      AND uf.family_id = NEW.id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS families_after_insert_add_admin ON public.families;
CREATE TRIGGER families_after_insert_add_admin
AFTER INSERT ON public.families
FOR EACH ROW
EXECUTE FUNCTION public.add_family_creator_as_admin();

-- Limit function execution surface
REVOKE EXECUTE ON FUNCTION public.add_family_creator_as_admin() FROM PUBLIC, anon, authenticated;
