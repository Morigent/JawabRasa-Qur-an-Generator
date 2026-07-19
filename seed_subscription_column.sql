-- Add is_subscribed column to public.users (admin can toggle this directly)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN NOT NULL DEFAULT FALSE;
