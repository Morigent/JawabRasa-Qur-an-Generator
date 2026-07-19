-- ============================================================
-- SKEMA DATABASE: Random Quotes Qur'an
-- Dialek: PostgreSQL
-- Fitur cakupan:
--   MVP          -> randomize ayat berdasarkan mood (free text input user),
--                   simpan quote jadi PNG
--   Nice-to-have -> general/bible quotes, konsultan berbayar
--   Admin        -> role-based access, verifikasi consultant, audit log
--
-- Catatan desain:
--   - Teks ayat (Arab, latin, terjemahan) TIDAK disimpan lokal.
--     Hanya nomor surah + nomor ayat, karena teks diambil dari
--     API Al-Qur'an eksternal (mis. equran.id / alquran.cloud).
--   - Mood BUKAN tabel referensi (lookup table), karena mood
--     berasal dari input bebas user, bukan daftar hardcode.
--   - role: 'user' | 'admin' | 'superadmin' (default: 'user')
--   - verification_status consultant: 'pending' | 'approved' | 'rejected'
-- ============================================================

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    role            VARCHAR(20)  NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user','admin','superadmin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. REFERENSI AYAT (nomor saja, teks diambil dari API Al-Qur'an)
-- ------------------------------------------------------------
CREATE TABLE ayat_refs (
    id              BIGSERIAL PRIMARY KEY,
    surah_number    SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayat_number     SMALLINT NOT NULL CHECK (ayat_number > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (surah_number, ayat_number)
);

-- Pool kurasi admin: ayat mana relevan untuk mood (teks) tertentu,
-- dipakai sebagai sumber randomize. Terpisah dari histori user.
CREATE TABLE ayat_moods (
    ayat_ref_id     BIGINT NOT NULL REFERENCES ayat_refs(id) ON DELETE CASCADE,
    mood            VARCHAR(50) NOT NULL,
    PRIMARY KEY (ayat_ref_id, mood)
);

CREATE INDEX idx_ayat_moods_mood ON ayat_moods(mood);

-- ------------------------------------------------------------
-- 2b. RIWAYAT AYAT-MOOD PER USER (konteks untuk consultant)
-- ------------------------------------------------------------
CREATE TABLE user_ayat_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ayat_ref_id     BIGINT NOT NULL REFERENCES ayat_refs(id) ON DELETE CASCADE,
    mood            VARCHAR(50) NOT NULL,   -- mood yang jadi alasan ayat ini di-generate
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uah_user_id ON user_ayat_history(user_id);
CREATE INDEX idx_uah_mood ON user_ayat_history(mood);
CREATE INDEX idx_uah_ayat_ref_id ON user_ayat_history(ayat_ref_id);

-- ------------------------------------------------------------
-- 3. NICE-TO-HAVE: general / bible quotes (kategori quote non-Qur'an)
-- ------------------------------------------------------------
CREATE TABLE quote_sources (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE   -- 'bible', 'general'
);

CREATE TABLE general_quotes (
    id              BIGSERIAL PRIMARY KEY,
    source_id       INT NOT NULL REFERENCES quote_sources(id),
    content         TEXT NOT NULL,
    author_or_ref   VARCHAR(150),                 -- misal "Mazmur 23:1" atau nama penulis
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. SIMPAN QUOTE JADI IMAGE/PNG
-- ------------------------------------------------------------
CREATE TABLE image_templates (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    background_url  TEXT,
    background_color VARCHAR(20),
    font_style      VARCHAR(50),
    category        VARCHAR(50),        -- contoh: minimalis, nature, dark-mode
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE saved_quote_images (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ayat_ref_id     BIGINT REFERENCES ayat_refs(id),         -- nullable jika sumbernya general_quote
    general_quote_id BIGINT REFERENCES general_quotes(id),   -- nullable jika sumbernya ayat
    template_id     INT REFERENCES image_templates(id),
    mood            VARCHAR(50),          -- mood saat quote di-generate (opsional)
    image_url       TEXT NOT NULL,        -- lokasi file PNG hasil generate (storage/CDN)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (ayat_ref_id IS NOT NULL AND general_quote_id IS NULL) OR
        (ayat_ref_id IS NULL AND general_quote_id IS NOT NULL)
    )
);

-- ------------------------------------------------------------
-- 5. CONSULTANT (nice-to-have, bisa berbayar)
-- ------------------------------------------------------------
CREATE TABLE consultants (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL, -- jika consultant juga login sbg user
    full_name           VARCHAR(150) NOT NULL,
    bio                 TEXT,
    photo_url           TEXT,
    specialization      VARCHAR(150),        -- contoh: kecemasan, motivasi, spiritual healing
    is_paid_service     BOOLEAN NOT NULL DEFAULT FALSE,   -- konsultan gratis vs berbayar
    price_per_session   NUMERIC(12,2) DEFAULT 0,
    rating_avg          NUMERIC(3,2) DEFAULT 0,
    verification_status VARCHAR(20)  NOT NULL DEFAULT 'pending'
                            CHECK (verification_status IN ('pending','approved','rejected')),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consultant_availability (
    id              BIGSERIAL PRIMARY KEY,
    consultant_id   BIGINT NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Minggu
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL
);

CREATE TABLE consultations (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultant_id           BIGINT NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    user_ayat_history_id    BIGINT REFERENCES user_ayat_history(id),  -- konteks ayat & mood sebelum sesi (opsional)
    mood                    VARCHAR(50),          -- mood saat booking sesi (boleh beda dari histori ayat)
    session_type            VARCHAR(20) NOT NULL DEFAULT 'chat' CHECK (session_type IN ('chat','call','video')),
    scheduled_at            TIMESTAMPTZ NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','confirmed','ongoing','completed','cancelled')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consultation_payments (
    id              BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
    amount          NUMERIC(12,2) NOT NULL DEFAULT 0,   -- 0 diperbolehkan (donasi/gratis)
    payment_method  VARCHAR(30),                        -- qris, e-wallet, transfer, dll
    payment_status  VARCHAR(20) NOT NULL DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
    paid_at         TIMESTAMPTZ
);

CREATE TABLE consultant_reviews (
    id              BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    consultant_id   BIGINT NOT NULL REFERENCES consultants(id),
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. ADMIN AUDIT LOG
-- ------------------------------------------------------------
-- Mencatat setiap tindakan admin/superadmin: siapa, apa, terhadap record mana.
CREATE TABLE admin_audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    admin_id        BIGINT NOT NULL REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,   -- mis: 'create_ayat', 'approve_consultant'
    target_table    VARCHAR(50),             -- nama tabel yang terdampak
    target_id       BIGINT,                  -- id record yang terdampak
    details         JSONB,                   -- payload tambahan (before/after, alasan, dsb)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_aal_admin_id    ON admin_audit_logs(admin_id);
CREATE INDEX idx_aal_action      ON admin_audit_logs(action);
CREATE INDEX idx_aal_target      ON admin_audit_logs(target_table, target_id);
CREATE INDEX idx_aal_created_at  ON admin_audit_logs(created_at DESC);
