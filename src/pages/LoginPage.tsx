import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/* ============================================================
   Login Page — JAWAB RASA
   ============================================================ */

const DISCOVERY_CHIPS = ['Patience', 'Gratitude', 'Wisdom', 'Courage', 'Serenity']

function LoginFormField({
  id,
  label,
  type = 'text',
  placeholder,
  rightSlot,
  delay = 0,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  rightSlot?: React.ReactNode
  delay?: number
}) {
  return (
    <div
      className="form-field animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.25rem' }}>
        <label className="form-label" htmlFor={id} style={{ marginBottom: 0 }}>
          {label}
        </label>
        {rightSlot}
      </div>
      <input
        className="form-input"
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'current-password' : 'email'}
      />
      <div className="form-input-underline" />
    </div>
  )
}

export default function LoginPage() {
  useEffect(() => { console.log('[Page] LoginPage mounted') }, [])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthContext()

  const isRegistered = searchParams.get('registered') === '1'
  const oauthFailed  = searchParams.get('error') === 'oauth_failed'

  const [localLoading, setLocalLoading] = useState(false)
  const isLoading = loading || localLoading

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    const form = e.currentTarget
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    setLocalLoading(true)
    const ok = await signIn({ email, password })
    setLocalLoading(false)

    if (ok) navigate('/dashboard')   // redirect after login
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

          {/* ── Card Header ── */}
          <div
            className="animate-fade-in-up"
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome Back
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'var(--color-on-surface-variant)' }}>
              Return to your path of reflection.
            </p>
          </div>

          {/* ── Post-registration Success Banner ── */}
          {isRegistered && (
            <div
              className="animate-fade-in-up"
              style={{
                background: 'rgba(65,95,65,0.07)',
                border: '1px solid rgba(65,95,65,0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 18, flexShrink: 0 }}>
                mark_email_read
              </span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-primary)', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                Account created! Check your email to confirm your address before signing in.
              </p>
            </div>
          )}

          {/* ── OAuth Error Banner ── */}
          {oauthFailed && (
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
              <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: 18, flexShrink: 0 }}>
                error
              </span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-error)', fontFamily: "'Inter', sans-serif" }}>
                Google sign-in failed. Please try again.
              </p>
            </div>
          )}

          {/* ── Auth Error Banner ── */}
          {error && (
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
              <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: 18, flexShrink: 0 }}>
                error
              </span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-error)', fontFamily: "'Inter', sans-serif" }}>
                {error}
              </p>
            </div>
          )}

          {/* ── Form ── */}
          <form
            id="login-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <LoginFormField
              id="email"
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              delay={100}
            />

            <LoginFormField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              delay={200}
              rightSlot={
                <Link
                  to="/forgot-password"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-secondary)')}
                >
                  Forgot Password?
                </Link>
              }
            />

            {/* Submit */}
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms', marginTop: '0.5rem' }}>
              <button
                className="btn-primary"
                type="submit"
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.8 : 1 }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>
                      progress_activity
                    </span>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          {/* ── OR Divider ── */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '400ms', display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.75rem 0' }}
          >
            <div style={{ flex: 1, height: 1, background: 'rgba(192,201,192,0.3)' }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(65,73,65,0.5)' }}>
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(192,201,192,0.3)' }} />
          </div>

          {/* ── Google Button ── */}
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              className="btn-secondary"
              type="button"
              onClick={signInWithGoogle}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* ── Sign Up link ── */}
          <div className="animate-fade-in-up" style={{ animationDelay: '600ms', marginTop: '1.75rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
              New to JAWAB RASA?{' '}
              <Link
                to="/signup"
                style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', borderBottom: '2px solid rgba(233,195,73,0.5)', paddingBottom: '1px', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(233,195,73,1)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(233,195,73,0.5)')}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* ── Discovery Chips ── */}
      <div
        className="no-scrollbar"
        style={{ marginTop: '2.5rem', display: 'flex', gap: '0.5rem', opacity: 0.45, transition: 'opacity 0.5s ease', overflowX: 'auto', maxWidth: '100%', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.45')}
      >
        {DISCOVERY_CHIPS.map((chip) => (
          <span key={chip} className="discovery-chip">{chip}</span>
        ))}
      </div>

      {/* ── Fixed Footer ── */}
      <footer style={{ position: 'fixed', bottom: 0, width: '100%', padding: '0.5rem', textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.5625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', margin: 0 }}>
          © 2024 JAWAB RASA • ILLUMINATED SERENITY
        </p>
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
