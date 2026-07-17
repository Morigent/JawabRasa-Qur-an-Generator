import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/* ============================================================
   FormField (signup variant)
   ============================================================ */
function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  required = false,
  delay = 0,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  delay?: number
}) {
  return (
    <div className="form-field animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        className="form-input"
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : 'name'}
      />
      <div className="form-input-underline" />
    </div>
  )
}

/* ============================================================
   Left Panel — Emerald Sanctuary
   ============================================================ */
function SanctuaryPanel() {
  return (
    <div className="sanctuary-panel hidden md:flex md:w-1/2 flex-col items-center justify-center px-12">
      <div className="arabesque-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="calligraphy-backdrop" aria-hidden="true">ب</div>

      <div className="relative z-10 text-center max-w-sm mx-auto">
        <div className="animate-fade-in-up mb-8" style={{ animationDelay: '100ms' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 1.5rem', borderRadius: '50%', background: 'rgba(176,240,214,0.12)', border: '1px solid rgba(176,240,214,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: 'rgba(176,240,214,0.9)', fontSize: 28 }}>auto_stories</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '1rem' }}>
            JAWAB RASA
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: 'rgba(149,211,186,0.9)', lineHeight: 1.7, maxWidth: '28rem', margin: '0 auto' }}>
            "Seeking the light in every verse,<br />finding the peace in every pause."
          </p>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="divider-shimmer" />
        </div>

        <div className="animate-fade-in-up mt-8 flex flex-col gap-3" style={{ animationDelay: '500ms' }}>
          {[
            { icon: 'brightness_5', text: "Daily curated Qur'anic verses" },
            { icon: 'mood',         text: 'Mood-based ayat discovery' },
            { icon: 'image',        text: 'Save quotes as beautiful images' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
              <span className="material-symbols-outlined" style={{ color: 'rgba(233,195,73,0.85)', fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', color: 'rgba(176,240,214,0.75)', letterSpacing: '0.02em' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Right Panel — Sign-Up Form
   ============================================================ */
function FormPanel() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuthContext()
  const [localLoading, setLocalLoading] = useState(false)
  const isLoading = loading || localLoading

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    const form     = e.currentTarget
    const fullName = (form.elements.namedItem('name')     as HTMLInputElement).value.trim()
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    setLocalLoading(true)
    const ok = await signUp({ fullName, email, password })
    setLocalLoading(false)

    if (ok) navigate('/login?registered=1')
  }

  return (
    <div className="form-panel w-full md:w-1/2 flex flex-col items-center px-8 py-12" style={{ overflowY: 'auto', height: '100vh' }}>
      <div className="vellum-texture" />
      <div style={{ flex: 1 }} />

      <div className="max-w-[400px] w-full z-10">
        {/* Mobile branding */}
        <div className="md:hidden mb-10 text-center">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>JAWAB RASA</h1>
          <div style={{ height: 2, width: 48, margin: '0.5rem auto 0', background: 'var(--color-secondary-container)' }} />
        </div>

        {/* Form header */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.375rem' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(65,73,65,0.8)', fontFamily: "'Inter', sans-serif" }}>
            Join our sanctuary for reflection and clarity.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="animate-fade-in-up" style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: 18, flexShrink: 0 }}>error</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-error)', fontFamily: "'Inter', sans-serif" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FormField id="name"     label="Full Name"      type="text"     placeholder="Ibrahim Khalid"      required delay={100} />
          <FormField id="email"    label="Email Address"  type="email"    placeholder="peace@JAWAB RASA.com"  required delay={200} />
          <FormField id="password" label="Password"       type="password" placeholder="••••••••••"           required delay={300} />

          {/* Checkbox */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <input className="custom-checkbox" id="reflections" name="reflections" type="checkbox" defaultChecked />
            <label htmlFor="reflections" style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.5, cursor: 'pointer', userSelect: 'none' }}>
              Send me daily reflections via email.{' '}
              <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                Start your morning with a curated verse for contemplation.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms', paddingTop: '0.5rem' }}>
            <button className="btn-primary" type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.8 : 1 }}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  Creating your sanctuary…
                </span>
              ) : 'Begin Your Journey'}
            </button>
          </div>
        </form>

        {/* Alternate actions */}
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms', marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
            Already have a sanctuary?{' '}
            <Link to="/login"
              style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', borderBottom: '2px solid rgba(233,195,73,0.5)', paddingBottom: '1px' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(233,195,73,1)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(233,195,73,0.5)')}
            >Sign In</Link>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(192,201,192,0.3)' }} />
            <span style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(65,73,65,0.5)', fontFamily: "'Inter', sans-serif" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(192,201,192,0.3)' }} />
          </div>

          <button className="btn-secondary" type="button" onClick={signInWithGoogle} disabled={isLoading}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.638-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer links */}
        <div className="animate-fade-in-up" style={{ animationDelay: '700ms', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(192,201,192,0.2)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', opacity: 0.5 }}>
          {['PRIVACY', 'TERMS', 'SUPPORT'].map((link) => (
            <a key={link} href="#"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
            >{link}</a>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }} />
    </div>
  )
}

/* ============================================================
   Signup Page
   ============================================================ */
export default function SignupPage() {
  return (
    <>
      <title>JAWAB RASA — Create Account</title>
      <meta name="description" content="Join JAWAB RASA and discover Qur'anic verses matched to your mood." />
      <main style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <SanctuaryPanel />
        <FormPanel />
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
