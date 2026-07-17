/**
 * ForgotPasswordPage — sends a password-reset email via Supabase Auth.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type PageState = 'idle' | 'loading' | 'sent' | 'error'

export default function ForgotPasswordPage() {
  const [state, setState] = useState<PageState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [sentEmail, setSentEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value.trim()
    if (!email) return

    setState('loading')
    setErrorMsg(null)

    const redirectTo = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      setErrorMsg(error.message)
      setState('error')
    } else {
      setSentEmail(email)
      setState('sent')
    }
  }

  return (
    <div
      className="islamic-pattern"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1.5rem 4rem',
      }}
    >
      {/* ── Fixed Header ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 50,
          background: 'rgba(249,249,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(192,201,192,0.2)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          JAWAB RASA
        </h1>
      </header>

      {/* ── Main Card ── */}
      <main
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
        className="card-reveal"
      >
        <div className="login-card gold-border-reveal" style={{ padding: '2rem' }}>

          {/* ── Icon ── */}
          <div
            className="animate-fade-in-up"
            style={{ textAlign: 'center', marginBottom: '1.75rem' }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: 'rgba(65,95,65,0.08)',
                border: '1px solid rgba(65,95,65,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--color-primary)', fontSize: 26 }}
              >
                lock_reset
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: '0.375rem',
                letterSpacing: '-0.02em',
              }}
            >
              Reset Password
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                color: 'var(--color-on-surface-variant)',
                lineHeight: 1.6,
              }}
            >
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* ── Sent State ── */}
          {state === 'sent' ? (
            <div
              className="animate-fade-in-up"
              style={{
                background: 'rgba(65,95,65,0.07)',
                border: '1px solid rgba(65,95,65,0.2)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                textAlign: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 36, color: 'var(--color-primary)', display: 'block', marginBottom: '0.75rem' }}
              >
                mark_email_read
              </span>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  marginBottom: '0.375rem',
                }}
              >
                Check your inbox
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  color: 'var(--color-on-surface-variant)',
                  lineHeight: 1.6,
                }}
              >
                We sent a reset link to{' '}
                <strong style={{ color: 'var(--color-primary)' }}>{sentEmail}</strong>.
                {' '}It may take a minute to arrive.
              </p>
            </div>
          ) : (
            <>
              {/* ── Error Banner ── */}
              {state === 'error' && errorMsg && (
                <div
                  className="animate-fade-in-up"
                  style={{
                    background: 'rgba(186,26,26,0.08)',
                    border: '1px solid rgba(186,26,26,0.2)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--color-error)', fontSize: 18, flexShrink: 0 }}
                  >
                    error
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--color-error)',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {errorMsg}
                  </p>
                </div>
              )}

              {/* ── Form ── */}
              <form
                id="forgot-password-form"
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div className="form-field animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <label className="form-label" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="form-input"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@domain.com"
                    autoComplete="email"
                    required
                  />
                  <div className="form-input-underline" />
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={state === 'loading'}
                    style={{ opacity: state === 'loading' ? 0.8 : 1 }}
                  >
                    {state === 'loading' ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}
                        >
                          progress_activity
                        </span>
                        Sending…
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Back to Login ── */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '300ms', marginTop: '1.75rem', textAlign: 'center' }}
          >
            <Link
              to="/login"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                color: 'var(--color-on-surface-variant)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-on-surface-variant)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                arrow_back
              </span>
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{ position: 'fixed', bottom: 0, width: '100%', padding: '0.5rem', textAlign: 'center', opacity: 0.5 }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.5625rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-on-surface-variant)',
            margin: 0,
          }}
        >
          © 2024 JAWAB RASA • ILLUMINATED SERENITY
        </p>
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
