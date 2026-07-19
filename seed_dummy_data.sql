-- ============================================================
-- DUMMY DATA — JAWAB RASA
-- Run this in Supabase SQL Editor.
-- Inserts into auth.users directly (SQL Editor has full access),
-- so the on_auth_user_created trigger auto-creates public.users rows.
-- Safe to re-run (uses ON CONFLICT / skips existing).
-- ============================================================

-- Ensure pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. AUTH USERS (via direct insert into auth schema)
--    The trigger on_auth_user_created will auto-create public.users rows.
-- ------------------------------------------------------------
DO $$
DECLARE
  uid uuid;
BEGIN
  -- superadmin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@test.com') THEN
    uid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'superadmin@test.com',
            crypt('Test123!', gen_salt('bf')), NOW(),
            jsonb_build_object('full_name', 'Aisha Rahman'),
            'authenticated', 'authenticated', NOW(), NOW());
    UPDATE public.users SET role = 'superadmin' WHERE id = uid;
  END IF;

  -- admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@test.com') THEN
    uid := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'admin@test.com',
            crypt('Test123!', gen_salt('bf')), NOW(),
            jsonb_build_object('full_name', 'Bilal Hassan'),
            'authenticated', 'authenticated', NOW(), NOW());
    UPDATE public.users SET role = 'admin' WHERE id = uid;
  END IF;

  -- regular users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user1@test.com') THEN
    uid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'user1@test.com',
            crypt('Test123!', gen_salt('bf')), NOW(),
            jsonb_build_object('full_name', 'Fatima Zahra'),
            'authenticated', 'authenticated', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user2@test.com') THEN
    uid := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'user2@test.com',
            crypt('Test123!', gen_salt('bf')), NOW(),
            jsonb_build_object('full_name', 'Yusuf Ibrahim'),
            'authenticated', 'authenticated', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user3@test.com') THEN
    uid := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'user3@test.com',
            crypt('Test123!', gen_salt('bf')), NOW(),
            jsonb_build_object('full_name', 'Layla Mahmoud'),
            'authenticated', 'authenticated', NOW(), NOW());
  END IF;

  -- Extra users referenced by history / consultations
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user4@test.com') THEN
    uid := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'user4@test.com',
            crypt('Test123!', gen_salt('bf')), NOW(),
            jsonb_build_object('full_name', 'Omar Farouq'),
            'authenticated', 'authenticated', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user5@test.com') THEN
    uid := 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'user5@test.com',
            crypt('Test123!', gen_salt('bf')), NOW(),
            jsonb_build_object('full_name', 'Zainab Ali'),
            'authenticated', 'authenticated', NOW(), NOW());
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2. AYAT REFS (skip if already seeded)
-- ------------------------------------------------------------
INSERT INTO public.ayat_refs (surah_number, ayat_number) VALUES
    (1,   1),   (2,   153), (2,   255), (2,   286),
    (3,   139), (3,   185), (9,   51),  (13,  28),
    (16,  97),  (18,  10),  (20,  25),  (28,  77),
    (39,  53),  (55,  1),   (94,  5),   (94,  6),
    (99,  7),   (103, 1),   (105, 1),   (112, 1)
ON CONFLICT (surah_number, ayat_number) DO NOTHING;

-- ------------------------------------------------------------
-- 3. MOOD TAGS (skip if already seeded)
-- ------------------------------------------------------------
INSERT INTO public.mood_tags (slug, label) VALUES
    ('anxious',     'Anxious'),     ('sad',         'Sad'),
    ('hopeful',     'Hopeful'),     ('grateful',    'Grateful'),
    ('happy',       'Happy'),
    ('fearful',     'Fearful'),     ('angry',       'Angry'),
    ('lonely',      'Lonely'),      ('confused',    'Confused'),
    ('peaceful',    'Peaceful'),    ('motivated',   'Motivated'),
    ('guilty',      'Guilty'),      ('doubtful',    'Doubtful'),
    ('overwhelmed', 'Overwhelmed'), ('heartbroken', 'Heartbroken'),
    ('stressed',    'Stressed'),    ('tired',       'Tired'),
    ('joyful',      'Joyful'),      ('loved',       'Loved'),
    ('patient',     'Patient'),     ('repentant',   'Repentant'),
    ('reflective',  'Reflective'),  ('discouraged', 'Discouraged'),
    ('lost',        'Lost'),
    ('general',     'General')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 4. AYAT MOODS
-- ------------------------------------------------------------
DO $$
DECLARE
  ref record;
BEGIN
  FOR ref IN SELECT id, surah_number, ayat_number FROM public.ayat_refs LOOP
    CASE
      WHEN ref.surah_number = 1   AND ref.ayat_number = 1   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'peaceful'), (ref.id, 'grateful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 2   AND ref.ayat_number = 153 THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'sad'), (ref.id, 'anxious'), (ref.id, 'patient') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 2   AND ref.ayat_number = 255 THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'grateful'), (ref.id, 'fearful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 2   AND ref.ayat_number = 286 THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'stressed'), (ref.id, 'anxious') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 3   AND ref.ayat_number = 139 THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'motivated'), (ref.id, 'hopeful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 3   AND ref.ayat_number = 185 THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'reflective'), (ref.id, 'sad') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 9   AND ref.ayat_number = 51  THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'anxious'), (ref.id, 'peaceful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 13  AND ref.ayat_number = 28  THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'anxious'), (ref.id, 'stressed'), (ref.id, 'peaceful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 16  AND ref.ayat_number = 97  THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'grateful'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 18  AND ref.ayat_number = 10  THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'hopeful'), (ref.id, 'stressed') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 20  AND ref.ayat_number = 25  THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'sad'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 28  AND ref.ayat_number = 77  THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'grateful'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 39  AND ref.ayat_number = 53  THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'guilty'), (ref.id, 'sad'), (ref.id, 'hopeful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 55  AND ref.ayat_number = 1   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'grateful'), (ref.id, 'peaceful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 94  AND ref.ayat_number = 5   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'stressed'), (ref.id, 'hopeful'), (ref.id, 'patient') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 94  AND ref.ayat_number = 6   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'stressed'), (ref.id, 'hopeful'), (ref.id, 'patient') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 99  AND ref.ayat_number = 7   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'grateful'), (ref.id, 'motivated') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 103 AND ref.ayat_number = 1   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'reflective'), (ref.id, 'motivated'), (ref.id, 'happy'), (ref.id, 'general') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 105 AND ref.ayat_number = 1   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'grateful') ON CONFLICT DO NOTHING;
      WHEN ref.surah_number = 112 AND ref.ayat_number = 1   THEN INSERT INTO public.ayat_moods VALUES (ref.id, 'grateful'), (ref.id, 'peaceful'), (ref.id, 'general') ON CONFLICT DO NOTHING;
      ELSE NULL;
    END CASE;
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- 5. USER AYAT HISTORY (references public.users by UUID)
-- ------------------------------------------------------------
INSERT INTO public.user_ayat_history (user_id, ayat_ref_id, mood) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', (SELECT id FROM public.ayat_refs WHERE surah_number = 2  AND ayat_number = 153), 'sad'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', (SELECT id FROM public.ayat_refs WHERE surah_number = 13 AND ayat_number = 28),  'anxious'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', (SELECT id FROM public.ayat_refs WHERE surah_number = 94 AND ayat_number = 5),  'stressed'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', (SELECT id FROM public.ayat_refs WHERE surah_number = 2  AND ayat_number = 286), 'overwhelmed'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', (SELECT id FROM public.ayat_refs WHERE surah_number = 16 AND ayat_number = 97), 'grateful'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', (SELECT id FROM public.ayat_refs WHERE surah_number = 99 AND ayat_number = 7),  'motivated'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', (SELECT id FROM public.ayat_refs WHERE surah_number = 39 AND ayat_number = 53), 'guilty'),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', (SELECT id FROM public.ayat_refs WHERE surah_number = 3  AND ayat_number = 139),'discouraged')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 6. GENERAL QUOTES
-- ------------------------------------------------------------
INSERT INTO public.general_quotes (source_id, content, author_or_ref) VALUES
  (1, 'The Lord is my shepherd; I shall not want.', 'Psalm 23:1'),
  (1, 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', 'Joshua 1:9'),
  (1, 'I can do all things through Him who strengthens me.', 'Philippians 4:13'),
  (1, 'The light shines in the darkness, and the darkness has not overcome it.', 'John 1:5'),
  (2, 'In the middle of difficulty lies opportunity.', 'Albert Einstein'),
  (2, 'The only way out is through.', 'Robert Frost'),
  (2, 'Peace begins with a smile.', 'Mother Teresa'),
  (2, 'This too shall pass.', 'Persian Proverb')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 7. IMAGE TEMPLATES
-- ------------------------------------------------------------
INSERT INTO public.image_templates (name, background_url, background_color, font_style, category, is_active) VALUES
  ('Minimal Light',  NULL, '#fafaf5', 'serif',     'minimalis', TRUE),
  ('Nature Dawn',    NULL, '#e8f5e9', 'sans-serif','nature',    TRUE),
  ('Gold Elegance',  NULL, '#1a1a2e', 'serif',     'dark-mode', TRUE),
  ('Calm Ocean',     NULL, '#e0f7fa', 'sans-serif','minimalis', TRUE),
  ('Night Sky',      NULL, '#0d1b2a', 'serif',     'dark-mode', TRUE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 8. CONSULTANTS (references nothing — user_id can be null)
-- ------------------------------------------------------------
INSERT INTO public.consultants (user_id, full_name, bio, photo_url, specialization, is_paid_service, price_per_session, rating_avg, verification_status, is_active) VALUES
  (NULL, 'Dr. Omar Al-Farsi', '15 years of academic research in Islamic philosophy and spiritual counselling.', NULL, 'Islamic Philosophy', TRUE,  150000, 4.8, 'approved', TRUE),
  (NULL, 'Fatima Noor',      'Specialist in breathwork and Quranic meditation techniques.',                NULL, 'Spiritual Wellness', TRUE,  200000, 4.9, 'approved', TRUE),
  (NULL, 'Ustaz Khalid',     'Expert in Tajweed and Quranic memorization for all ages.',                   NULL, 'Tajweed & Memorization', FALSE, 0, 4.7, 'approved', TRUE),
  (NULL, 'Prof. Hassan Rahim','Specializing in the historical context of Meccan and Madinan surahs.',      NULL, 'Historical Context', TRUE, 175000, 4.5, 'approved', TRUE),
  (NULL, 'Dr. Aisha Malik',  'Focusing on the healing dimension of Quranic recitation.',                  NULL, 'Linguistic Analysis', FALSE, 0, 4.6, 'approved', TRUE),
  (NULL, 'Khadijah Rose',    'Certified grief counsellor and spiritual coach.',                           NULL, 'Spiritual Wellness', TRUE, 120000, 4.3, 'pending',  TRUE),
  (NULL, 'Ustaz Bilal Idris','Expert in youth mentorship and family counselling from an Islamic perspective.', NULL, 'Motivation', TRUE, 100000, 0.0, 'pending',  FALSE),
  (NULL, 'Noura Hassan',     'Specializes in art therapy integrated with Quranic reflection.',             NULL, 'Spiritual Wellness', TRUE, 180000, 4.2, 'approved', TRUE),
  (NULL, 'Sayed Mustafa',    'Psychologist with a focus on anxiety and depression from an Islamic framework.', NULL, 'Anxiety Support', TRUE, 250000, 4.9, 'approved', TRUE),
  (NULL, 'Lina Ibrahim',     'Motherhood and parenting coach grounded in Quranic values.',                  NULL, 'Parenting', FALSE, 0, 4.4, 'rejected', FALSE);

-- ------------------------------------------------------------
-- 9. CONSULTANT AVAILABILITY
-- ------------------------------------------------------------
INSERT INTO public.consultant_availability (consultant_id, day_of_week, start_time, end_time)
SELECT c.id, v.d, v.t1::time, v.t2::time
FROM (VALUES
  ('Dr. Omar Al-Farsi',  1, '09:00', '17:00'), ('Dr. Omar Al-Farsi',  2, '09:00', '17:00'), ('Dr. Omar Al-Farsi',  3, '09:00', '12:00'),
  ('Fatima Noor',        1, '10:00', '18:00'), ('Fatima Noor',        3, '10:00', '18:00'), ('Fatima Noor',        5, '10:00', '14:00'),
  ('Ustaz Khalid',       2, '08:00', '16:00'), ('Ustaz Khalid',       4, '08:00', '16:00'), ('Ustaz Khalid',       6, '09:00', '12:00'),
  ('Prof. Hassan Rahim', 1, '13:00', '21:00'), ('Prof. Hassan Rahim', 4, '13:00', '21:00'),
  ('Dr. Aisha Malik',    3, '09:00', '15:00'), ('Dr. Aisha Malik',    5, '09:00', '15:00'),
  ('Noura Hassan',       2, '11:00', '19:00'), ('Noura Hassan',       4, '11:00', '19:00'), ('Noura Hassan',       6, '10:00', '14:00'),
  ('Sayed Mustafa',      1, '08:00', '16:00'), ('Sayed Mustafa',      2, '08:00', '16:00'), ('Sayed Mustafa',      3, '08:00', '16:00')
) AS v(cname, d, t1, t2)
JOIN public.consultants c ON c.full_name = v.cname;

-- ------------------------------------------------------------
-- 10. ADMIN AUDIT LOGS (references public.users by UUID)
-- ------------------------------------------------------------
INSERT INTO public.admin_audit_logs (admin_id, action, target_table, target_id, details) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'insert_ayat',        'ayat_refs',    1,  '{"surah": 1, "ayat": 1}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'approve_consultant', 'consultants',  1,  '{"consultant": "Dr. Omar Al-Farsi"}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'approve_consultant', 'consultants',  2,  '{"consultant": "Fatima Noor"}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'approve_consultant', 'consultants',  3,  '{"consultant": "Ustaz Khalid"}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'reject_consultant',  'consultants',  10, '{"consultant": "Lina Ibrahim", "reason": "credentials incomplete"}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'create_template',   'image_templates', 1, '{"name": "Minimal Light"}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'deactivate_user',   'users',        NULL,
    '{"user_uuid": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18", "user": "Hassan Malik", "reason": "violated terms of service"}');

-- ------------------------------------------------------------
-- 11. CONSULTATIONS (references public.users by UUID)
-- ------------------------------------------------------------
INSERT INTO public.consultations (user_id, consultant_id, mood, session_type, scheduled_at, status)
SELECT u.id, c.id, v.mood, v.session_type, NOW() + v.offset_interval, v.status
FROM (VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Dr. Omar Al-Farsi',  'sad',     'chat',  INTERVAL '1 day',  'confirmed'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Fatima Noor',        'anxious', 'call',  INTERVAL '2 days', 'pending'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Dr. Omar Al-Farsi',  'stressed','chat',  INTERVAL '-1 day', 'completed'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Prof. Hassan Rahim', 'curious', 'video', INTERVAL '3 days', 'confirmed'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Dr. Aisha Malik',    'grateful','chat',  INTERVAL '-3 days','completed')
) AS v(user_uuid, cname, mood, session_type, offset_interval, status)
JOIN public.users u ON u.id = v.user_uuid::uuid
JOIN public.consultants c ON c.full_name = v.cname;

-- ------------------------------------------------------------
-- 12. CONSULTATION PAYMENTS
-- ------------------------------------------------------------
INSERT INTO public.consultation_payments (consultation_id, amount, payment_method, payment_status, paid_at)
SELECT c.id, v.amount, v.method, v.pstatus, v.paid_at
FROM (VALUES
  (1, 150000, 'qris',     'paid',   NOW()),
  (3, 150000, 'qris',     'paid',   NOW() - INTERVAL '1 day'),
  (4, 175000, 'e-wallet', 'paid',   NOW()),
  (5, 0,      NULL,       'paid',   NOW() - INTERVAL '3 days')
) AS v(pos, amount, method, pstatus, paid_at)
JOIN public.consultations c ON c.id = v.pos;

-- ------------------------------------------------------------
-- 13. CONSULTANT REVIEWS
-- ------------------------------------------------------------
INSERT INTO public.consultant_reviews (consultation_id, user_id, consultant_id, rating, comment)
SELECT c.id, u.id, c.consultant_id, v.rating, v.comment
FROM (VALUES
  (3, 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 5, 'Very insightful session. Dr. Omar helped me see my struggles through a spiritual lens.'),
  (5, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 4, 'Kind and knowledgeable. Would recommend to anyone seeking linguistic clarity.')
) AS v(pos, user_uuid, rating, comment)
JOIN public.consultations c ON c.id = v.pos
JOIN public.users u ON u.id = v.user_uuid::uuid;
