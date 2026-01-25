-- Add covering index for FK: families.created_by
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_families_created_by_fk ON public.families (created_by);

-- Inspect current policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'family_invites';

-- Consolidate duplicate UPDATE policies for role authenticated (update USING/WITH CHECK after inspection)
DROP POLICY IF EXISTS family_invites_update_authenticated ON public.family_invites;
DROP POLICY IF EXISTS owners_admins_can_update_invites ON public.family_invites;
CREATE POLICY family_invites_update_authenticated_merged
ON public.family_invites
FOR UPDATE
TO authenticated
USING (
  /* (original_using_expr_a) OR (original_using_expr_b) */
)
WITH CHECK (
  /* (original_with_check_expr_a) OR (original_with_check_expr_b) */
);

-- Report index usage and definitions
WITH idx AS (
  SELECT
    n.nspname AS schema,
    c.relname AS index_name,
    t.relname AS table_name,
    pg_stat_user_indexes.idx_scan,
    pg_relation_size(c.oid) AS index_size,
    pg_get_indexdef(c.oid) AS index_def
  FROM pg_class c
  JOIN pg_index i ON i.indexrelid = c.oid
  JOIN pg_class t ON t.oid = i.indrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  LEFT JOIN pg_stat_user_indexes ON pg_stat_user_indexes.indexrelid = c.oid
  WHERE n.nspname = 'public'
    AND c.relname IN (
      'idx_family_members_user',
      'idx_families_created_at',
      'idx_family_members_user_family',
      'idx_patients_family',
      'idx_medications_family',
      'idx_nfc_tags_family',
      'idx_dose_events_family',
      'idx_family_memberships_user',
      'idx_dose_events_created_by',
      'idx_dose_events_medication_id',
      'idx_dose_events_patient_id',
      'idx_family_invites_invited_by_user_id',
      'idx_family_join_requests_decided_by_user_id',
      'idx_family_members_created_by_user_id',
      'idx_nfc_tags_medication_id',
      'idx_patient_weights_created_by',
      'idx_person_profiles_created_by',
      'idx_family_memberships_family',
      'idx_families_created_by',
      'idx_family_memberships_family_role',
      'idx_patient_weights_patient',
      'idx_person_permissions_person',
      'idx_person_permissions_user',
      'idx_person_profiles_family',
      'idx_user_families_user_family',
      'idx_user_families_family_id',
      'idx_family_invites_token',
      'idx_family_members_family_id',
      'idx_fjr_family_id',
      'idx_fjr_requested_by'
    )
)
SELECT *
FROM idx
ORDER BY idx_scan NULLS FIRST, index_size DESC;

-- Recommendations: keep if used by RLS predicates or expected queries; consider drop if idx_scan = 0 over a meaningful period and not needed
-- DROP INDEX CONCURRENTLY IF EXISTS public.idx_families_created_at; -- CONFIRM DROP
-- DROP INDEX CONCURRENTLY IF EXISTS public.idx_user_families_family_id; -- CONFIRM DROP
