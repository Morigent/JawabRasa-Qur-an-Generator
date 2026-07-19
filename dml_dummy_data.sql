-- ============================================================
-- DML: DUMMY DATA — JAWAB RASA
-- Based on supabase_migration.sql (Supabase Auth + UUID users)
-- ============================================================

-- ------------------------------------------------------------
-- 1. USERS (UUID from auth.users)
-- ------------------------------------------------------------
INSERT INTO public.users (id, full_name, email, avatar_url, role, is_active) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Aisha Rahman',    'aisha.rahman@example.com',   NULL, 'superadmin', TRUE),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Bilal Hassan',    'bilal.hassan@example.com',   NULL, 'admin',      TRUE),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Fatima Zahra',    'fatima.z@example.com',       NULL, 'user',       TRUE),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Yusuf Ibrahim',   'yusuf.ibrahim@example.com',  NULL, 'user',       TRUE),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Layla Mahmoud',   'layla.m@example.com',        NULL, 'user',       TRUE),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Omar Farouq',     'omar.f@example.com',         NULL, 'user',       TRUE),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Zainab Ali',      'zainab.ali@example.com',     NULL, 'user',       TRUE),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Hassan Malik',    'hassan.m@example.com',       NULL, 'user',       FALSE),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Nour Al-Din',     'nour.d@example.com',         NULL, 'user',       TRUE),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Sarah Ahmed',     'sarah.a@example.com',        NULL, 'user',       TRUE);

-- ------------------------------------------------------------
-- 2. AYAT REFS
-- ------------------------------------------------------------
INSERT INTO public.ayat_refs (surah_number, ayat_number) VALUES
  (1,   1),   -- Al-Fatihah 1
  (2,   153), -- Al-Baqarah 153: patience & prayer
  (2,   255), -- Al-Baqarah 255: Ayat Kursi
  (2,   286), -- Al-Baqarah 286: no burden beyond capacity
  (3,   139), -- Ali Imran 139: do not be weak
  (3,   185), -- Ali Imran 185: every soul shall taste death
  (9,   51),  -- At-Taubah 51: nothing befalls us except what Allah decreed
  (13,  28),  -- Ar-Ra'd 28: hearts find peace in remembrance
  (16,  97),  -- An-Nahl 97: whoever does good, male or female
  (18,  10),  -- Al-Kahf 10: grant us mercy
  (20,  25),  -- Ta-Ha 25: Lord, expand my chest
  (28,  77),  -- Al-Qasas 77: seek the Hereafter
  (39,  53),  -- Az-Zumar 53: despair not of Allah's mercy
  (55,  1),   -- Ar-Rahman 1
  (94,  5),   -- Ash-Sharh 5: with hardship comes ease
  (94,  6),   -- Ash-Sharh 6: with hardship comes ease
  (99,  7),   -- Az-Zalzalah 7: whoever does atom's weight of good
  (103, 1),   -- Al-Asr 1: by time
  (105, 1),   -- Al-Fil 1
  (112, 1);   -- Al-Ikhlas 1

-- ------------------------------------------------------------
-- 2b. AYAT MOODS
-- ------------------------------------------------------------
INSERT INTO public.ayat_moods (ayat_ref_id, mood) VALUES
  (1,  'peaceful'),     (1,  'grateful'),
  (2,  'sad'),          (2,  'anxious'),     (2,  'patient'),
  (3,  'grateful'),     (3,  'fearful'),
  (4,  'stressed'),     (4,  'anxious'),
  (5,  'discouraged'),  (5,  'lost'),
  (6,  'reflective'),
  (7,  'anxious'),      (7,  'peaceful'),
  (8,  'anxious'),      (8,  'stressed'),    (8,  'peaceful'),
  (9,  'grateful'),     (9,  'motivated'),
  (10, 'hopeful'),      (10, 'stressed'),
  (11, 'sad'),          (11, 'motivated'),
  (12, 'grateful'),     (12, 'motivated'),
  (13, 'guilty'),       (13, 'sad'),         (13, 'hopeful'),
  (14, 'grateful'),
  (15, 'stressed'),     (15, 'hopeful'),     (15, 'patient'),
  (16, 'stressed'),     (16, 'hopeful'),     (16, 'patient'),
  (17, 'grateful'),     (17, 'motivated'),
  (18, 'reflective'),
  (19, 'grateful'),
  (20, 'grateful'),     (20, 'peaceful');

-- ------------------------------------------------------------
-- 2c. USER AYAT HISTORY
-- ------------------------------------------------------------
INSERT INTO public.user_ayat_history (user_id, ayat_ref_id, mood) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2,  'sad'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 8,  'anxious'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 15, 'stress'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 4,  'overwhelmed'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 9,  'grateful'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 17, 'motivated'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 13, 'guilty'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 11, 'lost'),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 5,  'discouraged'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 8,  'peaceful'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 10, 'hopeful'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 3,  'fearful');

-- ------------------------------------------------------------
-- 3. GENERAL QUOTES
-- ------------------------------------------------------------
INSERT INTO public.general_quotes (source_id, content, author_or_ref) VALUES
  (1, 'The Lord is my shepherd; I shall not want.', 'Psalm 23:1'),
  (1, 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', 'Joshua 1:9'),
  (1, 'I can do all things through Him who strengthens me.', 'Philippians 4:13'),
  (1, 'The light shines in the darkness, and the darkness has not overcome it.', 'John 1:5'),
  (2, 'In the middle of difficulty lies opportunity.', 'Albert Einstein'),
  (2, 'The only way out is through.', 'Robert Frost'),
  (2, 'Peace begins with a smile.', 'Mother Teresa'),
  (2, 'This too shall pass.', 'Persian Proverb');

-- ------------------------------------------------------------
-- 4. IMAGE TEMPLATES
-- ------------------------------------------------------------
INSERT INTO public.image_templates (name, background_url, background_color, font_style, category, is_active) VALUES
  ('Minimal Light',  NULL, '#fafaf5', 'serif',     'minimalis', TRUE),
  ('Nature Dawn',    NULL, '#e8f5e9', 'sans-serif','nature',    TRUE),
  ('Gold Elegance',  NULL, '#1a1a2e', 'serif',     'dark-mode', TRUE),
  ('Calm Ocean',     NULL, '#e0f7fa', 'sans-serif','minimalis', TRUE),
  ('Night Sky',      NULL, '#0d1b2a', 'serif',     'dark-mode', TRUE);

-- ------------------------------------------------------------
-- 5. CONSULTANTS
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
-- 5b. CONSULTANT AVAILABILITY
-- ------------------------------------------------------------
INSERT INTO public.consultant_availability (consultant_id, day_of_week, start_time, end_time) VALUES
  (1, 1, '09:00', '17:00'),  (1, 2, '09:00', '17:00'),  (1, 3, '09:00', '12:00'),
  (2, 1, '10:00', '18:00'),  (2, 3, '10:00', '18:00'),  (2, 5, '10:00', '14:00'),
  (3, 2, '08:00', '16:00'),  (3, 4, '08:00', '16:00'),  (3, 6, '09:00', '12:00'),
  (4, 1, '13:00', '21:00'),  (4, 4, '13:00', '21:00'),
  (5, 3, '09:00', '15:00'),  (5, 5, '09:00', '15:00'),
  (8, 2, '11:00', '19:00'),  (8, 4, '11:00', '19:00'),  (8, 6, '10:00', '14:00'),
  (9, 1, '08:00', '16:00'),  (9, 2, '08:00', '16:00'),  (9, 3, '08:00', '16:00');

-- ------------------------------------------------------------
-- 5c. CONSULTATIONS
-- ------------------------------------------------------------
INSERT INTO public.consultations (user_id, consultant_id, user_ayat_history_id, mood, session_type, scheduled_at, status) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1,  1,  'sad',     'chat', NOW() + INTERVAL '1 day',  'confirmed'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2,  2,  'anxious', 'call', NOW() + INTERVAL '2 days', 'pending'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1,  3,  'stressed','chat', NOW() - INTERVAL '1 day',  'completed'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 4,  NULL, 'curious', 'video', NOW() + INTERVAL '3 days', 'confirmed'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 5,  6,  'grateful','chat', NOW() - INTERVAL '3 days', 'completed'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 9,  7,  'guilty',  'chat', NOW() + INTERVAL '1 day',  'confirmed'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 9,  8,  'lost',    'call', NOW() + INTERVAL '5 days', 'pending'),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 5,  NULL, 'discouraged','chat', NOW() - INTERVAL '7 days', 'completed'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 8,  11, 'stressed','chat', NOW() + INTERVAL '2 days', 'confirmed'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 3,  12, 'fearful', 'video', NOW() + INTERVAL '4 days', 'pending');

-- ------------------------------------------------------------
-- 5d. CONSULTATION PAYMENTS
-- ------------------------------------------------------------
INSERT INTO public.consultation_payments (consultation_id, amount, payment_method, payment_status, paid_at) VALUES
  (1, 150000, 'qris', 'paid',   NOW()),
  (3, 150000, 'qris', 'paid',   NOW() - INTERVAL '1 day'),
  (4, 175000, 'e-wallet', 'paid', NOW()),
  (5, 0,      NULL,   'paid',   NOW() - INTERVAL '3 days'),
  (6, 250000, 'transfer', 'paid', NOW()),
  (8, 0,      NULL,   'paid',   NOW() - INTERVAL '7 days'),
  (9, 180000, 'qris', 'unpaid', NULL);

-- ------------------------------------------------------------
-- 5e. CONSULTANT REVIEWS
-- ------------------------------------------------------------
INSERT INTO public.consultant_reviews (consultation_id, user_id, consultant_id, rating, comment) VALUES
  (3, 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1, 5, 'Very insightful session. Dr. Omar helped me see my struggles through a spiritual lens.'),
  (5, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 5, 4, 'Kind and knowledgeable. Would recommend to anyone seeking linguistic clarity.'),
  (8, 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 5, 5, 'A gentle soul who truly listens.');

-- ------------------------------------------------------------
-- 6. ADMIN AUDIT LOGS
-- ------------------------------------------------------------
INSERT INTO public.admin_audit_logs (admin_id, action, target_table, target_id, details) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'insert_ayat',        'ayat_refs',    1,  '{"surah": 1, "ayat": 1}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'approve_consultant', 'consultants',  1,  '{"consultant": "Dr. Omar Al-Farsi"}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'approve_consultant', 'consultants',  2,  '{"consultant": "Fatima Noor"}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'approve_consultant', 'consultants',  3,  '{"consultant": "Ustaz Khalid"}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'reject_consultant',  'consultants',  10, '{"consultant": "Lina Ibrahim", "reason": "credentials incomplete"}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'create_template',   'image_templates', 1, '{"name": "Minimal Light"}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'deactivate_user',   'users',        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    '{"user": "Hassan Malik", "reason": "violated terms of service"}');
