-- OTC medication enhancements and prescription medication table

ALTER TABLE IF EXISTS public.otc_medications
  ADD COLUMN IF NOT EXISTS default_dose_amount numeric,
  ADD COLUMN IF NOT EXISTS default_dose_unit text,
  ADD COLUMN IF NOT EXISTS dose_frequency text,
  ADD COLUMN IF NOT EXISTS max_daily_dose_amount numeric,
  ADD COLUMN IF NOT EXISTS max_daily_dose_unit text,
  ADD COLUMN IF NOT EXISTS route text,
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS warnings text,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.prescription_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id uuid NOT NULL REFERENCES public.family_members (id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  form text,
  strength_label text,
  concentration_label text,
  prescribed_dose_amount numeric,
  prescribed_dose_unit text,
  dose_frequency text,
  route text,
  prn boolean DEFAULT false,
  indication text,
  instructions text,
  prescriber text,
  pharmacy text,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prescription_medications_member_id_idx
  ON public.prescription_medications (family_member_id);

ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS prescription_medications_family_access
  ON public.prescription_medications
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

CREATE POLICY IF NOT EXISTS prescription_medications_family_modify
  ON public.prescription_medications
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

DROP TRIGGER IF EXISTS prescription_medications_touch_updated_at ON public.prescription_medications;
CREATE TRIGGER prescription_medications_touch_updated_at
BEFORE UPDATE ON public.prescription_medications
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.otc_medications (
  code,
  brand_name,
  generic_name,
  form,
  concentration_label,
  category,
  default_dose_amount,
  default_dose_unit,
  dose_frequency,
  max_daily_dose_amount,
  max_daily_dose_unit,
  route,
  instructions,
  warnings,
  display_order
)
VALUES
  (
    'ibuprofen-suspension-100mg-5ml',
    'Motrin',
    'Ibuprofen',
    'suspension',
    '100 mg/5 mL',
    'pain-fever',
    5,
    'mL',
    'q6h PRN',
    40,
    'mg/kg/day',
    'oral',
    'Shake well. Measure with oral syringe or dosing cup.',
    'Use weight-based dosing. Avoid duplicate NSAIDs.',
    10
  ),
  (
    'acetaminophen-suspension-160mg-5ml',
    'Tylenol',
    'Acetaminophen',
    'suspension',
    '160 mg/5 mL',
    'pain-fever',
    5,
    'mL',
    'q4-6h PRN',
    75,
    'mg/kg/day',
    'oral',
    'Shake well. Measure with oral syringe or dosing cup.',
    'Avoid combining with other acetaminophen products.',
    20
  ),
  (
    'diphenhydramine-liquid-12-5mg-5ml',
    'Benadryl',
    'Diphenhydramine',
    'liquid',
    '12.5 mg/5 mL',
    'allergy',
    5,
    'mL',
    'q6h PRN',
    300,
    'mg/day',
    'oral',
    'Measure with oral syringe or dosing cup.',
    'May cause drowsiness.',
    30
  ),
  (
    'loratadine-tablet-10mg',
    'Claritin',
    'Loratadine',
    'tablet',
    '10 mg',
    'allergy',
    1,
    'tablet',
    'daily',
    1,
    'tablet/day',
    'oral',
    'Once daily dosing.',
    'Non-drowsy for most people.',
    40
  ),
  (
    'cetirizine-tablet-10mg',
    'Zyrtec',
    'Cetirizine',
    'tablet',
    '10 mg',
    'allergy',
    1,
    'tablet',
    'daily',
    1,
    'tablet/day',
    'oral',
    'Once daily dosing.',
    'May cause drowsiness.',
    50
  ),
  (
    'loperamide-tablet-2mg',
    'Imodium',
    'Loperamide',
    'tablet',
    '2 mg',
    'gi',
    1,
    'tablet',
    'q6-8h PRN',
    8,
    'tablet/day',
    'oral',
    'Take after loose stool.',
    'Do not exceed max daily dose.',
    60
  ),
  (
    'omeprazole-capsule-20mg',
    'Prilosec',
    'Omeprazole',
    'capsule',
    '20 mg',
    'gi',
    1,
    'capsule',
    'daily',
    1,
    'capsule/day',
    'oral',
    'Take before a meal.',
    'Short-term use unless directed by clinician.',
    70
  ),
  (
    'psyllium-powder-3-4g',
    'Metamucil',
    'Psyllium',
    'powder',
    '3.4 g',
    'gi',
    1,
    'packet',
    'daily',
    3,
    'packet/day',
    'oral',
    'Mix with at least 8 oz of water.',
    'Increase water intake.',
    80
  ),
  (
    'glycerin-suppository-2g',
    'Fleet',
    'Glycerin',
    'suppository',
    '2 g',
    'gi',
    1,
    'suppository',
    'daily PRN',
    1,
    'suppository/day',
    'rectal',
    'Insert rectally. Stay near restroom.',
    'Do not use for longer than 1 week unless directed.',
    90
  )
ON CONFLICT (code) DO NOTHING;
