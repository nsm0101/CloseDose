ALTER TABLE public.dose_logs
  ADD COLUMN IF NOT EXISTS tag_id text,
  ADD COLUMN IF NOT EXISTS dose_time timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS medication text,
  ADD COLUMN IF NOT EXISTS interval_minutes integer,
  ADD COLUMN IF NOT EXISTS member_name text;

UPDATE public.dose_logs
SET dose_time = administered_at
WHERE dose_time IS NULL;

UPDATE public.dose_logs
SET medication = COALESCE(medication, medication_label, medication_code)
WHERE medication IS NULL;

UPDATE public.dose_logs dl
SET member_name = fm.name
FROM public.family_members fm
WHERE dl.family_member_id = fm.id
  AND dl.member_name IS NULL;

CREATE INDEX IF NOT EXISTS dose_logs_member_time_idx ON public.dose_logs (family_member_id, dose_time DESC);
CREATE INDEX IF NOT EXISTS dose_logs_tag_id_idx ON public.dose_logs (tag_id);
