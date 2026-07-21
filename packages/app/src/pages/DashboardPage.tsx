/**
 * DashboardPage — JAWAB RASA main authenticated view.
 *
 * Sections:
 *  - Fixed TopAppBar with nav links
 *  - Welcome greeting
 *  - Daily Verse Reveal Card (mood → verse reveal)
 *  - Connect with Consultants
 *  - Explore Themes chips
 *  - Mobile Bottom NavBar
 *  - Footer
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@jawabrasa/shared'
import { apiFetch } from '../lib/api'
import { useAuthContext } from '../context/AuthContext'
import ProfileDropdown from '../components/ProfileDropdown'

/* ── Mood options ── */
const MOODS = [
  { label: 'Happy',    icon: 'sentiment_very_satisfied' },
  { label: 'Sad',      icon: 'sentiment_dissatisfied' },
  { label: 'Anxious',  icon: 'sentiment_extremely_dissatisfied' },
  { label: 'Peaceful', icon: 'sentiment_neutral' },
  { label: 'Grateful', icon: 'favorite' },
  { label: 'Lost',     icon: 'explore_off' },
]

/* ══════════════════════════════════════════════════════════
   MoodModal
   ══════════════════════════════════════════════════════════ */
function MoodModal({ onReveal }: { onReveal: (mood: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [custom, setCustom] = useState('')

  const mood = custom.trim() || selected || ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-container-padding"
      id="mood-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(39,49,65,0.45)' }}
        onClick={() => onReveal('skipped')}
      />

      {/* Modal card */}
      <div
        className="relative w-full max-w-sm rounded-xl overflow-hidden border-t-2 border-secondary-container animate-fade-in-up"
        style={{
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 20px 60px rgba(6,78,59,0.15)',
        }}
      >
        {/* Golden glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/10 blur-3xl -mr-12 -mt-12 rounded-full pointer-events-none" />

        <div className="p-stack-gap-md relative z-10">

          {/* Header */}
          <div className="text-center mb-stack-gap-md">
            <span
              className="text-secondary inline-block mb-2"
              style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Sacred Reflection
            </span>
            <h2
              className="text-primary"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}
            >
              How are you feeling today?
            </h2>
            <p
              className="text-on-surface-variant mt-2"
              style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 1.5 }}
            >
              Sharing your mood helps us curate a verse that speaks to your heart.
            </p>
          </div>

          {/* Mood grid */}
          <div className="grid grid-cols-3 gap-2 mb-stack-gap-md">
            {MOODS.map((mood) => (
              <button
                key={mood.label}
                onClick={() => setSelected(mood.label)}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-all active:scale-95"
                style={{
                  border: selected === mood.label
                    ? '1.5px solid var(--color-secondary)'
                    : '1.5px solid rgba(192,201,192,0.3)',
                  background: selected === mood.label
                    ? 'rgba(254,214,91,0.15)'
                    : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 26,
                    color: selected === mood.label ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)',
                    fontVariationSettings: selected === mood.label ? "'FILL' 1" : "'FILL' 0",
                    transition: 'color 0.2s',
                  }}
                >
                  {mood.icon}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: selected === mood.label ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)',
                  }}
                >
                  {mood.label.toUpperCase()}
                </span>
              </button>
            ))}
          </div>

          {/* Custom mood input */}
          <div className="mb-stack-gap-md">
            <label
              htmlFor="custom-mood"
              style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}
            >
              Or describe your mood in your own words…
            </label>
            <input
              id="custom-mood"
              type="text"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null) }}
              placeholder="e.g., Grateful, overwhelmed, curious…"
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low transition-colors"
              style={{
                padding: '0.75rem',
                fontFamily: 'Inter',
                fontSize: 14,
                outline: 'none',
                color: 'var(--color-on-surface)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-secondary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(192,201,192,0.3)')}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              className="w-full bg-primary text-on-primary rounded-full transition-all active:scale-95"
              onClick={() => onReveal(mood)}
              disabled={!selected && !custom.trim()}
              style={{
                padding: '0.875rem',
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: selected || custom.trim() ? 'pointer' : 'not-allowed',
                boxShadow: selected || custom.trim() ? '0 8px 24px rgba(6,78,59,0.25)' : 'none',
                opacity: selected || custom.trim() ? 1 : 0.6,
              }}
            >
              Reveal My Verse
            </button>
            <button
              className="w-full py-2 text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity"
              style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => onReveal('skipped')}
            >
              Skip
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

const CONSULTANTS = [
  {
    id: 1,
    name: 'Dr. Omar Farooq',
    specialty: 'Spiritual Psychology',
    avatar: '/consultant_omar.png',
  },
  {
    id: 2,
    name: 'Sarah Al-Zahrani',
    specialty: 'Mindfulness Coach',
    avatar: '/consultant_sarah.png',
  },
]

const THEMES = ['Peace', 'Forgiveness', 'Creation', 'Prophets', 'Patience', 'Gratitude']

/* ══════════════════════════════════════════════════════════
   DashboardPage
   ══════════════════════════════════════════════════════════ */
const MAX_GENERATES = 3

function getGenerateCount(): number {
  const raw = localStorage.getItem('jawabrasa_generate_count')
  return raw ? Number(raw) : 0
}

function setGenerateCount(n: number) {
  localStorage.setItem('jawabrasa_generate_count', String(n))
}

export default function DashboardPage() {
  useEffect(() => { console.log('[Page] DashboardPage mounted') }, [])
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [verseRevealed, setVerseRevealed] = useState(false)
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [generateCount, setGenerateCountState] = useState(getGenerateCount)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [verseData, setVerseData] = useState<{
    surah_number: number
    ayat_number: number
    arabic_text: string
    translation: string
    mood_resolved: string
  } | null>(null)
  const [verseLoading, setVerseLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('users')
      .select('is_subscribed')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.is_subscribed) setIsSubscribed(true)
      })
  }, [user?.id])

  const effectiveMax = isSubscribed ? 999 : MAX_GENERATES
  const remaining = Math.max(0, effectiveMax - generateCount)

  function handleGenerate() {
    if (generateCount >= effectiveMax) {
      navigate('/subscription')
      return
    }
    setShowMoodModal(true)
  }

  async function handleReveal(mood: string) {
    setShowMoodModal(false)
    if (mood === 'skipped') {
      return // just close the modal, no mockup
    }
    setVerseRevealed(true)
    setVerseLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const res = await apiFetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ mood }),
      })
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const data = await res.json()
      setVerseData(data)
      const next = generateCount + 1
      setGenerateCount(next)
      setGenerateCountState(next)
    } catch (err) {
      console.error('[Dashboard] Generate failed:', err)
      setVerseRevealed(false)
      setVerseData(null)
    } finally {
      setVerseLoading(false)
    }
  }

  const displayName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Friend'

  return (
    <div
      className="bg-background text-on-surface min-h-screen flex flex-col"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <title>JAWAB RASA — Dashboard</title>

      {/* ── Top App Bar ── */}
      <header
        className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm"
      >
        <div
          className="flex justify-between items-center px-container-padding py-unit mx-auto"
          style={{ maxWidth: 640 }}
        >
          <span
            className="text-primary tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}
          >
            JAWAB RASA
          </span>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-stack-gap-md items-center">
            {[
              { label: 'Home', path: '/dashboard' },
              { label: 'Reflect', path: '/reflect' },
              { label: 'Inbox', path: '/inbox' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => {
                  if (item.path === '#') { e.preventDefault(); return }
                  e.preventDefault()
                  navigate(item.path)
                }}
                className="transition-colors"
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  color: item.path === '/dashboard' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                }}
                onMouseEnter={(e) => { if (item.path !== '/dashboard') e.currentTarget.style.color = 'var(--color-primary)' }}
                onMouseLeave={(e) => { if (item.path !== '/dashboard') e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
              >
                {item.label.toUpperCase()}
              </a>
            ))}
          </nav>

          {/* Icon actions */}
          <div className="flex items-center gap-4">
            <button
              className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title="History"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>history</span>
            </button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main
        className="pt-24 pb-stack-gap-lg px-container-padding mx-auto w-full"
        style={{ maxWidth: 640, paddingBottom: '6rem' }}
      >

        {/* Welcome */}
        <section className="mb-stack-gap-lg animate-fade-in-up">
          <p
            className="text-secondary mb-2"
            style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            SALAAM, {displayName.toUpperCase()}
          </p>
          <h1
            className="text-primary"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.4 }}
          >
            Your Morning Light
          </h1>
        </section>

        {/* ── Usage counter ── */}
        <section className="mb-stack-gap-sm flex justify-center animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold"
            style={{
              background: remaining > 0 ? 'rgba(115,92,0,0.08)' : 'rgba(186,26,26,0.08)',
              color: remaining > 0 ? 'var(--color-secondary)' : 'var(--color-error)',
              border: `1px solid ${remaining > 0 ? 'rgba(115,92,0,0.15)' : 'rgba(186,26,26,0.15)'}`,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {isSubscribed ? 'workspace_premium' : remaining > 0 ? 'auto_awesome' : 'error_outline'}
            </span>
            {isSubscribed
              ? 'Unlimited reflections — Pro member'
              : remaining > 0
                ? `${remaining} / ${MAX_GENERATES} daily reflections remaining`
                : 'Daily limit reached'}
          </div>
        </section>

        {/* ── Daily Verse Card ── */}
        <section className="mb-stack-gap-lg animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div
            id="verse-card"
            className={`landing-card gold-border-top rounded-xl p-stack-gap-md transition-all duration-700 ${!verseRevealed ? 'reveal-shimmer cursor-pointer' : ''}`}
            style={{ boxShadow: '0 10px 30px rgba(6,78,59,0.05)' }}
          >
            {!verseRevealed ? (
              /* Placeholder */
              <div className="text-center py-stack-gap-lg">
                <span
                  className="material-symbols-outlined text-secondary block mb-4"
                  style={{ fontSize: 40 }}
                >
                  auto_awesome
                </span>
                <h2
                  className="text-primary mb-6"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}
                >
                  How are you feeling today?
                </h2>
                <button
                  className="bg-primary text-on-primary rounded-full transition-all active:scale-95"
                  style={{
                    padding: '0.75rem 2rem',
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(6,78,59,0.2)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-container)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
                  onClick={(e) => { e.stopPropagation(); handleGenerate() }}
                >
                  Select Your Mood
                </button>
              </div>
            ) : (
              /* Revealed verse */
              <div className="animate-fade-in-up">
                {verseLoading ? (
                  <div className="text-center py-8 text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: 14 }}>
                    <span className="material-symbols-outlined animate-spin inline-block mr-2">progress_activity</span>
                    Finding your verse...
                  </div>
                ) : (
                  <>
                <p
                  className="text-primary text-right mb-6 leading-relaxed"
                  dir="rtl"
                  style={{ fontFamily: "'Amiri', serif", fontSize: 32, lineHeight: 1.8 }}
                >
                  {(verseData?.arabic_text ?? '')}
                </p>
                <p
                  className="text-on-surface mb-4"
                  style={{ fontFamily: "'Roboto', sans-serif", fontSize: 20, fontWeight: 300, lineHeight: 1.6, fontStyle: 'italic' }}
                >
                  {(verseData?.translation ?? '')}
                </p>
                <div
                  className="flex justify-between items-center border-t border-outline-variant/30 pt-4"
                >
                  <span
                    className="text-on-surface-variant"
                    style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em' }}
                  >
                    {verseData
                      ? `Surah ${verseData.surah_number}:${verseData.ayat_number}`
                      : ''}
                  </span>
                  <div className="flex gap-4">
                    <button
                      className="text-secondary hover:scale-110 transition-transform"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      aria-label="Share"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>share</span>
                    </button>
                    <button
                      className="text-secondary hover:scale-110 transition-transform"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      aria-label="Bookmark"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>bookmark</span>
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => handleGenerate()}
                    className="flex items-center gap-2 rounded-full transition-all active:scale-95 hover:shadow-md"
                    style={{
                      padding: '0.6rem 1.4rem',
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      color: 'var(--color-primary)',
                      background: 'var(--color-surface-container-low)',
                      border: '1px solid rgba(192,201,192,0.4)',
                      cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>autorenew</span>
                    Generate Another
                  </button>
                </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-stack-gap-lg">

          {/* ── Consultants ── */}
          <section
            className="rounded-2xl p-6 border animate-fade-in-up"
            style={{
              animationDelay: '240ms',
              background: 'rgba(0,53,39,0.04)',
              borderColor: 'rgba(0,53,39,0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>psychology</span>
              <h2
                className="text-primary"
                style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                Connect with Consultants
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {CONSULTANTS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 rounded-xl border border-white p-3"
                  style={{ background: 'rgba(255,255,255,0.6)' }}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3
                      className="text-primary"
                      style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600 }}
                    >
                      {c.name}
                    </h3>
                    <p
                      className="text-on-surface-variant"
                      style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}
                    >
                      {c.specialty}
                    </p>
                  </div>
                  <button
                    className="bg-primary text-on-primary rounded-full transition-colors active:scale-95"
                    style={{
                      padding: '0.375rem 1rem',
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-container)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── Explore Themes ── */}
          <section className="animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            <h2
              className="text-on-surface-variant mb-4"
              style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Explore Themes
            </h2>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => (
                <span
                  key={theme}
                  className="cursor-pointer rounded-full transition-colors"
                  style={{
                    background: 'rgba(115,92,0,0.1)',
                    color: 'var(--color-secondary)',
                    padding: '0.375rem 1rem',
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(115,92,0,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(115,92,0,0.1)')}
                >
                  {theme}
                </span>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full py-stack-gap-md mt-auto bg-surface-container-low text-center"
        style={{ paddingBottom: '5rem' }}
      >
        <div
          className="flex flex-col items-center gap-unit px-container-padding mx-auto"
          style={{ maxWidth: 640 }}
        >
          <span
            className="text-secondary"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}
          >
            JAWAB RASA
          </span>
            <div className="flex gap-4 my-2 flex-wrap justify-center">
            {['Privacy', 'Terms', 'Support', 'Consultants'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-on-surface-variant opacity-70 hover:text-primary hover:opacity-100 transition-all"
                style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase' }}
              >
                {link}
              </a>
            ))}
          </div>
          <p
            className="text-on-surface-variant opacity-60"
            style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.1em' }}
          >
            © 2024 JAWAB RASA. Seek your light.
          </p>
        </div>
      </footer>

      {/* ── Mood Modal ── */}
      {showMoodModal && (
        <MoodModal onReveal={handleReveal} />
      )}
    </div>
  )
}
