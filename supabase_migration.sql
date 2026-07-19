-- ============================================================
-- SUPABASE AUTH MIGRATION
-- Run this in Supabase SQL Editor (Settings → SQL Editor → New query)
--
-- Key changes vs original schema.sql:
--   - public.users.id is UUID (matches auth.users.id from Supabase Auth)
--   - password_hash column is removed (Supabase Auth owns passwords)
--   - A trigger auto-creates a public.users row on every new sign-up
--   - Row Level Security (RLS) is enabled — users can only read their own data
--   - role column added: 'user' | 'admin' | 'superadmin'
--   - consultants.verification_status: 'pending' | 'approved' | 'rejected'
--   - admin_audit_logs table for tracking admin actions
-- ============================================================

-- ------------------------------------------------------------
-- 0. Extensions
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. USERS (mirrors auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    avatar_url      TEXT,
    role            VARCHAR(20)  NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user','admin','superadmin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create public.users row when a new auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Admin dapat membaca semua profil user
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('admin','superadmin')
        )
    );
-- Superadmin dapat mengubah role user
CREATE POLICY "Superadmin can update roles" ON public.users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role = 'superadmin'
        )
    );

-- ------------------------------------------------------------
-- 2. AYAT REFS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ayat_refs (
    id              BIGSERIAL PRIMARY KEY,
    surah_number    SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayat_number     SMALLINT NOT NULL CHECK (ayat_number > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (surah_number, ayat_number)
);

CREATE TABLE IF NOT EXISTS public.ayat_moods (
    ayat_ref_id     BIGINT NOT NULL REFERENCES public.ayat_refs(id) ON DELETE CASCADE,
    mood            VARCHAR(50) NOT NULL,
    PRIMARY KEY (ayat_ref_id, mood)
);
CREATE INDEX IF NOT EXISTS idx_ayat_moods_mood ON public.ayat_moods(mood);

-- ------------------------------------------------------------
-- 2b. USER AYAT HISTORY
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_ayat_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ayat_ref_id     BIGINT NOT NULL REFERENCES public.ayat_refs(id) ON DELETE CASCADE,
    mood            VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uah_user_id    ON public.user_ayat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_uah_mood       ON public.user_ayat_history(mood);
CREATE INDEX IF NOT EXISTS idx_uah_ayat_ref   ON public.user_ayat_history(ayat_ref_id);

ALTER TABLE public.user_ayat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own history" ON public.user_ayat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON public.user_ayat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. QUOTE SOURCES & GENERAL QUOTES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_sources (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO public.quote_sources (name) VALUES ('bible'), ('general') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.general_quotes (
    id              BIGSERIAL PRIMARY KEY,
    source_id       INT NOT NULL REFERENCES public.quote_sources(id),
    content         TEXT NOT NULL,
    author_or_ref   VARCHAR(150),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. IMAGE TEMPLATES & SAVED QUOTE IMAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.image_templates (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    background_url   TEXT,
    background_color VARCHAR(20),
    font_style       VARCHAR(50),
    category         VARCHAR(50),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.saved_quote_images (
    id               BIGSERIAL PRIMARY KEY,
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ayat_ref_id      BIGINT REFERENCES public.ayat_refs(id),
    general_quote_id BIGINT REFERENCES public.general_quotes(id),
    template_id      INT REFERENCES public.image_templates(id),
    mood             VARCHAR(50),
    image_url        TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (ayat_ref_id IS NOT NULL AND general_quote_id IS NULL) OR
        (ayat_ref_id IS NULL AND general_quote_id IS NOT NULL)
    )
);
ALTER TABLE public.saved_quote_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own images" ON public.saved_quote_images
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. CONSULTANTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultants (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID UNIQUE REFERENCES public.users(id) ON DELETE SET NULL,
    full_name           VARCHAR(150) NOT NULL,
    bio                 TEXT,
    photo_url           TEXT,
    specialization      VARCHAR(150),
    is_paid_service     BOOLEAN NOT NULL DEFAULT FALSE,
    price_per_session   NUMERIC(12,2) DEFAULT 0,
    rating_avg          NUMERIC(3,2) DEFAULT 0,
    verification_status VARCHAR(20)  NOT NULL DEFAULT 'pending'
                            CHECK (verification_status IN ('pending','approved','rejected')),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hanya consultant dengan status 'approved' yang tampil publik
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved consultants" ON public.consultants FOR SELECT
    USING (verification_status = 'approved' AND is_active = TRUE);
CREATE POLICY "Admins can view all consultants" ON public.consultants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('admin','superadmin')
        )
    );
CREATE POLICY "Admins can update consultant verification" ON public.consultants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('admin','superadmin')
        )
    );
CREATE POLICY "Admins can insert consultants" ON public.consultants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('admin','superadmin')
        )
    );

CREATE TABLE IF NOT EXISTS public.consultant_availability (
    id              BIGSERIAL PRIMARY KEY,
    consultant_id   BIGINT NOT NULL REFERENCES public.consultants(id) ON DELETE CASCADE,
    day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS public.consultations (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    consultant_id        BIGINT NOT NULL REFERENCES public.consultants(id) ON DELETE CASCADE,
    user_ayat_history_id BIGINT REFERENCES public.user_ayat_history(id),
    mood                 VARCHAR(50),
    session_type         VARCHAR(20) NOT NULL DEFAULT 'chat'
                             CHECK (session_type IN ('chat','call','video')),
    scheduled_at         TIMESTAMPTZ NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','confirmed','ongoing','completed','cancelled')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consultation_payments (
    id              BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL UNIQUE REFERENCES public.consultations(id) ON DELETE CASCADE,
    amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method  VARCHAR(30),
    payment_status  VARCHAR(20) NOT NULL DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
    paid_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.consultant_reviews (
    id              BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL UNIQUE REFERENCES public.consultations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES public.users(id),
    consultant_id   BIGINT NOT NULL REFERENCES public.consultants(id),
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. ADMIN AUDIT LOG
-- ------------------------------------------------------------
-- Mencatat setiap tindakan admin/superadmin: siapa, apa, terhadap record mana.
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    admin_id        UUID NOT NULL REFERENCES public.users(id),
    action          VARCHAR(100) NOT NULL,   -- mis: 'create_ayat', 'approve_consultant'
    target_table    VARCHAR(50),             -- nama tabel yang terdampak
    target_id       BIGINT,                  -- id record yang terdampak
    details         JSONB,                   -- payload tambahan (before/after, alasan, dsb)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aal_admin_id   ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_aal_action     ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_aal_target     ON public.admin_audit_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_aal_created_at ON public.admin_audit_logs(created_at DESC);

-- RLS: hanya admin/superadmin yang bisa membaca dan menulis audit log
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('admin','superadmin')
        )
    );
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('admin','superadmin')
        )
    );

-- ------------------------------------------------------------
-- 7. HELPER: fungsi cek apakah user saat ini adalah admin
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin','superadmin')
  );
$$;
