-- Clean up test users with broken password hashes.
-- Must delete child tables first (some FKs don't cascade).
-- Run this, then hit POST /api/seed to recreate via Auth API.

DELETE FROM public.consultant_reviews WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@test.com');
DELETE FROM public.consultation_payments WHERE consultation_id IN (SELECT id FROM public.consultations WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@test.com'));
DELETE FROM public.consultations WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@test.com');
DELETE FROM public.admin_audit_logs WHERE admin_id IN (SELECT id FROM public.users WHERE email LIKE '%@test.com');
DELETE FROM public.user_ayat_history WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@test.com');
DELETE FROM auth.users WHERE email LIKE '%@test.com';
