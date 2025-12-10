-- Supporting indexes for user_families
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_families_family_user
  ON public.user_families (family_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_families_user_family_role
  ON public.user_families (user_id, family_id, role);
