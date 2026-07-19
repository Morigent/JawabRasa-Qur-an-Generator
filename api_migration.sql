-- ============================================================
-- API Schema Additions (Phase 1 — MVP)
-- Run this in Supabase SQL Editor after supabase_migration.sql.
--
-- Adds: mood_tags, mood_synonyms, mood_resolution_logs,
--       pg_trgm extension, FK from ayat_moods to mood_tags,
--       validated_against_api tracking on ayat_refs.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ------------------------------------------------------------
-- 1. mood_tags — canonical mood slugs curated by admins
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mood_tags (
    slug        VARCHAR(50) PRIMARY KEY,
    label       VARCHAR(100) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- 2. mood_synonyms — admin-curated word variants -> canonical slug
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mood_synonyms (
    synonym     VARCHAR(100) PRIMARY KEY,
    mood_slug   VARCHAR(50) NOT NULL REFERENCES public.mood_tags(slug)
);

-- ------------------------------------------------------------
-- 3. mood_resolution_logs — every non-exact-match input logged here
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mood_resolution_logs (
    id            BIGSERIAL PRIMARY KEY,
    raw_input     VARCHAR(500) NOT NULL,
    resolved_slug VARCHAR(50) REFERENCES public.mood_tags(slug),
    method        VARCHAR(20) NOT NULL CHECK (method IN ('exact','synonym','fuzzy','ai','unresolved')),
    confidence    NUMERIC(4,3),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mood_logs_unresolved
    ON public.mood_resolution_logs(method)
    WHERE method = 'unresolved';
CREATE INDEX IF NOT EXISTS idx_mood_logs_created_at
    ON public.mood_resolution_logs(created_at DESC);

-- ------------------------------------------------------------
-- 4. ayat_refs — track validation against external API
-- ------------------------------------------------------------
ALTER TABLE public.ayat_refs
    ADD COLUMN IF NOT EXISTS validated_against_api BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- ------------------------------------------------------------
-- 5. Migrate existing ayat_moods.mood values into mood_tags
--    (so the FK constraint below won't fail)
-- ------------------------------------------------------------
INSERT INTO public.mood_tags (slug, label)
SELECT DISTINCT mood, mood
FROM public.ayat_moods
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 6. FK: ayat_moods.mood -> mood_tags.slug
-- ------------------------------------------------------------
ALTER TABLE public.ayat_moods
    DROP CONSTRAINT IF EXISTS ayat_moods_mood_fkey;
ALTER TABLE public.ayat_moods
    ADD CONSTRAINT ayat_moods_mood_fkey
    FOREIGN KEY (mood) REFERENCES public.mood_tags(slug);

-- ------------------------------------------------------------
-- 7. RLS for mood_tags, mood_synonyms (readable by all authenticated users)
-- ------------------------------------------------------------
ALTER TABLE public.mood_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read mood_tags" ON public.mood_tags;
CREATE POLICY "Anyone can read mood_tags"
    ON public.mood_tags FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage mood_tags" ON public.mood_tags;
CREATE POLICY "Admins can manage mood_tags"
    ON public.mood_tags FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
    );

ALTER TABLE public.mood_synonyms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read mood_synonyms" ON public.mood_synonyms;
CREATE POLICY "Anyone can read mood_synonyms"
    ON public.mood_synonyms FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage mood_synonyms" ON public.mood_synonyms;
CREATE POLICY "Admins can manage mood_synonyms"
    ON public.mood_synonyms FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
    );

-- mood_resolution_logs: readable by admins, insertable by the API service role
ALTER TABLE public.mood_resolution_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read mood_resolution_logs" ON public.mood_resolution_logs;
CREATE POLICY "Admins can read mood_resolution_logs"
    ON public.mood_resolution_logs FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
    );
-- The API service role (server-side) bypasses RLS entirely via the service_role key.

-- ------------------------------------------------------------
-- 8. Fuzzy mood matching via pg_trgm
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fuzzy_match_mood(input TEXT, threshold NUMERIC DEFAULT 0.35)
RETURNS TABLE(slug VARCHAR, score NUMERIC)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT slug, similarity(slug, input) AS score
  FROM mood_tags
  WHERE is_active = true AND similarity(slug, input) > threshold
  ORDER BY score DESC
  LIMIT 1;
$$;
