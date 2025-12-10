-- RLS configuration for families and user_families
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_families ENABLE ROW LEVEL SECURITY;

-- Members of a family can view it
CREATE POLICY IF NOT EXISTS families_member_select
  ON public.families
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = id
        AND uf.user_id = (SELECT auth.uid())
    )
  );

-- Authenticated users can create a family they own
CREATE POLICY IF NOT EXISTS families_admin_insert
  ON public.families
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by_user_id = (SELECT auth.uid()));

-- Only admins can update families
CREATE POLICY IF NOT EXISTS families_admin_update
  ON public.families
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = id
        AND uf.user_id = (SELECT auth.uid())
        AND uf.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = id
        AND uf.user_id = (SELECT auth.uid())
        AND uf.role = 'admin'
    )
  );

-- Only admins can delete families
CREATE POLICY IF NOT EXISTS families_admin_delete
  ON public.families
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = id
        AND uf.user_id = (SELECT auth.uid())
        AND uf.role = 'admin'
    )
  );

-- user_families access policies
CREATE POLICY IF NOT EXISTS user_families_self_select
  ON public.user_families
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY IF NOT EXISTS user_families_self_insert
  ON public.user_families
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY IF NOT EXISTS user_families_self_update
  ON public.user_families
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY IF NOT EXISTS user_families_self_delete
  ON public.user_families
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
