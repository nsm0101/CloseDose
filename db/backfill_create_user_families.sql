-- Backfill helper to ensure every family has an admin membership when created_by_user_id is present
INSERT INTO public.user_families (user_id, family_id, role)
SELECT f.created_by_user_id, f.id, 'admin'
FROM public.families f
WHERE f.created_by_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_families uf
    WHERE uf.user_id = f.created_by_user_id
      AND uf.family_id = f.id
  );
