/**
 * AuthCallbackPage — handles the OAuth redirect from Supabase after Google sign-in.
 *
 * Supabase's client automatically exchanges the code for a session when it detects
 * a `code` param in the URL (detectSessionInUrl: true is the default).
 * We simply listen for the SIGNED_IN event and redirect to /dashboard.
 *
 * DO NOT call exchangeCodeForSession() manually — it double-consumes the PKCE
 * verifier and causes "auth code and verifier should be non-empty" errors.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@jawabrasa/shared'

export default function AuthCallbackPage() {
  useEffect(() => { console.log('[Page] AuthCallbackPage mounted') }, [])
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'error'>('processing')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    // 1. If a session already exists (e.g. page refreshed), go straight to dashboard
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setErrorMsg(error.message)
        setStatus('error')
        setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 2500)
        return
      }
      if (session) {
        navigate('/dashboard', { replace: true })
      }
    })

    // 2. Otherwise wait for Supabase to auto-exchange the code and emit SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      }
      if (event === 'TOKEN_REFRESHED' && session) {
        navigate('/dashboard', { replace: true })
      }
    })

    // Timeout fallback — if nothing fires in 10s, show error
    const timeout = setTimeout(() => {
      setErrorMsg('Sign-in timed out. Please try again.')
      setStatus('error')
      setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 2500)
    }, 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div
      className="islamic-pattern"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      {status === 'processing' ? (
        <>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 40,
              color: 'var(--color-primary)',
              animation: 'spin 1s linear infinite',
              display: 'block',
            }}
          >
            progress_activity
          </span>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--color-on-surface-variant)',
              textAlign: 'center',
            }}
          >
            Completing sign-in…
          </p>
        </>
      ) : (
        <>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 40, color: 'var(--color-error)', display: 'block' }}
          >
            error
          </span>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--color-error)',
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            {errorMsg ?? 'Authentication failed. Redirecting…'}
          </p>
        </>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
