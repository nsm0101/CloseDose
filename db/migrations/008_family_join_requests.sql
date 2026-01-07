-- Add family join requests and extended membership permissions
CREATE TABLE IF NOT EXISTS public.family_join_requests (
  family_id uuid NOT NULL REFERENCES public.families (id) ON DELETE CASCADE,
  requester_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  requested_role text NOT NULL CHECK (requested_role IN ('admin', 'member')),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'denied')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (family_id, requester_user_id)
);

ALTER TABLE public.user_families
  ADD COLUMN IF NOT EXISTS parental_permissions boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_co_admin boolean DEFAULT false;

ALTER TABLE public.family_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS family_join_requests_requester_select
  ON public.family_join_requests
  FOR SELECT
  TO authenticated
  USING (requester_user_id = (SELECT auth.uid()));

CREATE POLICY IF NOT EXISTS family_join_requests_requester_insert
  ON public.family_join_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (requester_user_id = (SELECT auth.uid()));

CREATE POLICY IF NOT EXISTS family_join_requests_requester_update
  ON public.family_join_requests
  FOR UPDATE
  TO authenticated
  USING (requester_user_id = (SELECT auth.uid()))
  WITH CHECK (requester_user_id = (SELECT auth.uid()));

CREATE POLICY IF NOT EXISTS family_join_requests_admin_select
  ON public.family_join_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = (SELECT auth.uid())
        AND uf.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS family_join_requests_admin_update
  ON public.family_join_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = (SELECT auth.uid())
        AND uf.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_families uf
      WHERE uf.family_id = family_id
        AND uf.user_id = (SELECT auth.uid())
        AND uf.role = 'admin'
    )
  );
