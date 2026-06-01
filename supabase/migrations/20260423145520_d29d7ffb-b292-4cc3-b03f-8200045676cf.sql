ALTER TABLE public.maker_profiles
  ADD COLUMN IF NOT EXISTS machines jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS zip text;