-- ============================================================
-- TEST DATA SETUP — Run in Supabase SQL Editor
-- Order: run api_migration.sql first, then this file.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Seed mood_tags (skips if already populated)
-- ------------------------------------------------------------
INSERT INTO public.mood_tags (slug, label) VALUES
    ('anxious',        'Anxious'),
    ('sad',            'Sad'),
    ('hopeful',        'Hopeful'),
    ('grateful',       'Grateful'),
    ('happy',          'Happy'),
    ('fearful',        'Fearful'),
    ('angry',          'Angry'),
    ('lonely',         'Lonely'),
    ('confused',       'Confused'),
    ('peaceful',       'Peaceful'),
    ('motivated',      'Motivated'),
    ('guilty',         'Guilty'),
    ('doubtful',       'Doubtful'),
    ('overwhelmed',    'Overwhelmed'),
    ('heartbroken',    'Heartbroken'),
    ('stressed',       'Stressed'),
    ('tired',          'Tired'),
    ('joyful',         'Joyful'),
    ('loved',          'Loved'),
    ('patient',        'Patient'),
    ('repentant',      'Repentant'),
    ('general',        'General')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Ayat refs (works independently of auth.users)
-- ------------------------------------------------------------
INSERT INTO public.ayat_refs (surah_number, ayat_number) VALUES
    (1,   1),
    (2,   153),
    (2,   255),
    (2,   286),
    (3,   139),
    (3,   185),
    (9,   51),
    (13,  28),
    (16,  97),
    (18,  10),
    (20,  25),
    (28,  77),
    (39,  53),
    (55,  1),
    (94,  5),
    (94,  6),
    (99,  7),
    (103, 1),
    (105, 1),
    (112, 1)
ON CONFLICT (surah_number, ayat_number) DO NOTHING;

-- ------------------------------------------------------------
-- 3. Ayat moods — map each ref → mood tag (FK-safe, mood_tags populated above)
-- ------------------------------------------------------------
-- Get the actual id values from ayat_refs we just inserted
DO $$
DECLARE
  ref record;
BEGIN
  FOR ref IN SELECT id, surah_number, ayat_number FROM public.ayat_refs LOOP
    -- Al-Fatihah 1
    IF ref.surah_number = 1 AND ref.ayat_number = 1 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'peaceful'), (ref.id, 'grateful'), (ref.id, 'happy'), (ref.id, 'general') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Baqarah 153
    IF ref.surah_number = 2 AND ref.ayat_number = 153 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'sad'), (ref.id, 'anxious'), (ref.id, 'patient') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Baqarah 255
    IF ref.surah_number = 2 AND ref.ayat_number = 255 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'grateful'), (ref.id, 'fearful') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Baqarah 286
    IF ref.surah_number = 2 AND ref.ayat_number = 286 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'stressed'), (ref.id, 'anxious') ON CONFLICT DO NOTHING;
    END IF;
    -- Ali Imran 139
    IF ref.surah_number = 3 AND ref.ayat_number = 139 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'motivated'), (ref.id, 'hopeful') ON CONFLICT DO NOTHING;
    END IF;
    -- Ali Imran 185
    IF ref.surah_number = 3 AND ref.ayat_number = 185 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'reflective'), (ref.id, 'sad') ON CONFLICT DO NOTHING;
    END IF;
    -- At-Taubah 51
    IF ref.surah_number = 9 AND ref.ayat_number = 51 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'anxious'), (ref.id, 'peaceful') ON CONFLICT DO NOTHING;
    END IF;
    -- Ar-Ra'd 28
    IF ref.surah_number = 13 AND ref.ayat_number = 28 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'anxious'), (ref.id, 'stressed'), (ref.id, 'peaceful') ON CONFLICT DO NOTHING;
    END IF;
    -- An-Nahl 97
    IF ref.surah_number = 16 AND ref.ayat_number = 97 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'grateful'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Kahf 10
    IF ref.surah_number = 18 AND ref.ayat_number = 10 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'hopeful'), (ref.id, 'stressed') ON CONFLICT DO NOTHING;
    END IF;
    -- Ta-Ha 25
    IF ref.surah_number = 20 AND ref.ayat_number = 25 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'sad'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Qasas 77
    IF ref.surah_number = 28 AND ref.ayat_number = 77 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'grateful'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
    END IF;
    -- Az-Zumar 53
    IF ref.surah_number = 39 AND ref.ayat_number = 53 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'guilty'), (ref.id, 'sad'), (ref.id, 'hopeful') ON CONFLICT DO NOTHING;
    END IF;
    -- Ar-Rahman 1
    IF ref.surah_number = 55 AND ref.ayat_number = 1 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'grateful'), (ref.id, 'peaceful') ON CONFLICT DO NOTHING;
    END IF;
    -- Ash-Sharh 5
    IF ref.surah_number = 94 AND ref.ayat_number = 5 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'stressed'), (ref.id, 'hopeful'), (ref.id, 'patient') ON CONFLICT DO NOTHING;
    END IF;
    -- Ash-Sharh 6
    IF ref.surah_number = 94 AND ref.ayat_number = 6 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'stressed'), (ref.id, 'hopeful'), (ref.id, 'patient') ON CONFLICT DO NOTHING;
    END IF;
    -- Az-Zalzalah 7
    IF ref.surah_number = 99 AND ref.ayat_number = 7 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'grateful'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Asr 1
    IF ref.surah_number = 103 AND ref.ayat_number = 1 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'reflective'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Fil 1
    IF ref.surah_number = 105 AND ref.ayat_number = 1 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'grateful') ON CONFLICT DO NOTHING;
    END IF;
    -- Al-Ikhlas 1
    IF ref.surah_number = 112 AND ref.ayat_number = 1 THEN
      INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES (ref.id, 'grateful'), (ref.id, 'peaceful'), (ref.id, 'general') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
