/**
 * useAuth — thin wrapper around Supabase Auth
 *
 * Exposes:
 *   - session / user   → current Supabase session & user object
 *   - loading          → true while the initial session is being fetched
 *   - signUp()         → creates a Supabase auth account + inserts a row in public.users
 *   - signIn()         → signs in with email + password
 *   - signInWithGoogle()
 *   - signOut()
 *   - error            → last auth error string
 */

import { useState, useEffect, useCallback } from 'react'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@jawabrasa/shared'

export interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null
}

export interface AuthActions {
  signUp: (params: { fullName: string; email: string; password: string }) => Promise<boolean>
  signIn: (params: { email: string; password: string }) => Promise<boolean>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export function useAuth(): AuthState & AuthActions {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  /* ── Bootstrap: restore session from storage ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Sign Up ── */
  const signUp = useCallback(async ({
    fullName, email, password,
  }: { fullName: string; email: string; password: string }): Promise<boolean> => {
    setError(null)
    setLoading(true)
    try {
      // Supabase Auth creates the account + the trigger on_auth_user_created
      // automatically inserts a row into public.users (SECURITY DEFINER, bypasses RLS).
      // No manual INSERT needed — doing so would violate RLS.
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (authErr) throw authErr
      if (!data.user) throw new Error('Sign-up succeeded but no user returned.')

      return true
    } catch (e: unknown) {
      setError(formatError(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Sign In ── */
  const signIn = useCallback(async ({
    email, password,
  }: { email: string; password: string }): Promise<boolean> => {
    setError(null)
    setLoading(true)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr
      return true
    } catch (e: unknown) {
      setError(formatError(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Google OAuth ── */
  const signInWithGoogle = useCallback(async () => {
    setError(null)
    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (authErr) setError(formatError(authErr))
  }, [])

  /* ── Sign Out ── */
  const signOut = useCallback(async () => {
    setError(null)
    await supabase.auth.signOut()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { session, user, loading, error, signUp, signIn, signInWithGoogle, signOut, clearError }
}

/* ── Helpers ── */
function formatError(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return (e as AuthError).message
  }
  return String(e)
}
