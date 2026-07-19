-- Fix infinite RLS recursion on users, consultants, and admin_audit_logs.
-- The original policies use a subquery on public.users to check admin role,
-- which triggers RLS on public.users again → infinite recursion.
-- Fix: drop the recursive policies and use a SECURITY DEFINER helper function.

-- 1. SECURITY DEFINER helper — bypasses RLS when checking admin role
CREATE OR REPLACE FUNCTION public.is_admin_user()
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

-- 2. Fix users policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT
    USING (public.is_admin_user());

DROP POLICY IF EXISTS "Superadmin can update roles" ON public.users;
CREATE POLICY "Superadmin can update roles" ON public.users FOR UPDATE
    USING (public.is_admin_user());

-- 3. Fix consultants policies
DROP POLICY IF EXISTS "Admins can view all consultants" ON public.consultants;
CREATE POLICY "Admins can view all consultants" ON public.consultants FOR SELECT
    USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can update consultant verification" ON public.consultants;
CREATE POLICY "Admins can update consultant verification" ON public.consultants FOR UPDATE
    USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can insert consultants" ON public.consultants;
CREATE POLICY "Admins can insert consultants" ON public.consultants FOR INSERT
    WITH CHECK (public.is_admin_user());

-- 4. Fix admin_audit_logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT
    WITH CHECK (public.is_admin_user());
