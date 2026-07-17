/**
 * SubscriptionPage — Pricing / membership plans.
 *
 * Seeker (free, limited) and Soul Seeker (paid, unlimited).
 * Shows a feature spotlight for Soul Seeker perks.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const TOP_NAV = [
  { label: 'Home',    path: '/dashboard' },
  { label: 'Reflect', path: '/reflect' },
  { label: 'Inbox',   path: '/inbox' },
]

/* ══════════════════════════════════════════════════════════
   SubscriptionPage
   ══════════════════════════════════════════════════════════ */
export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { signOut } = useAuthContext()

  /* ── Reveal animation ── */
  const [visibleCards, setVisibleCards] = useState<boolean[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'))
            setVisibleCards((prev) => {
              const next = [...prev]
              next[idx] = true
              return next
            })
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1 }
    )

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-surface text-on-surface font-ui-body antialiased min-h-screen flex flex-col">
      <title>JAWAB RASA — Subscription</title>

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-container-padding py-unit max-w-[1200px] mx-auto">
          <span
            className="text-primary tracking-tight cursor-pointer"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}
            onClick={() => navigate('/dashboard')}
          >
            JAWAB RASA
          </span>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-stack-gap-md items-center">
            {TOP_NAV.map((item) => (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => { e.preventDefault(); navigate(item.path) }}
                className="transition-colors"
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
              >
                {item.label.toUpperCase()}
              </a>
            ))}
          </nav>

          {/* Icon actions */}
          <div className="flex items-center gap-stack-gap-sm">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200">
              history
            </button>
            <button
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200"
              onClick={signOut}
            >
              account_circle
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-stack-gap-lg">
        {/* Hero Section */}
        <section className="max-w-max-content-width mx-auto px-container-padding text-center mb-stack-gap-lg">
          <span className="font-ui-label-caps text-ui-label-caps text-secondary mb-unit block">
            MEMBERSHIP
          </span>
          <h1
            className="text-primary mb-stack-gap-sm"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.4 }}
          >
            Deepen Your Journey
          </h1>
          <p
            className="text-ui-body text-on-surface-variant opacity-80 leading-relaxed max-w-lg mx-auto"
            style={{ fontSize: 16, lineHeight: 1.6 }}
          >
            Choose a path that nurtures your soul. From daily reminders to personalized spiritual guidance.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="mx-auto px-container-padding grid grid-cols-1 gap-stack-gap-md items-center max-w-[800px] md:grid-cols-2">
          {/* Seeker Tier */}
          <div
            ref={(el) => { cardRefs.current[0] = el }}
            data-index={0}
            className="bg-surface-container-lowest p-stack-gap-md rounded-xl border border-outline-variant/30 flex flex-col h-full transition-all duration-700"
            style={{
              boxShadow: '0 10px 30px rgba(6,78,59,0.05)',
              opacity: visibleCards[0] ? 1 : 0,
              transform: visibleCards[0] ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <div className="mb-stack-gap-md">
              <h3 className="font-ui-label-caps text-ui-label-caps text-on-surface-variant mb-unit">
                SEEKER
              </h3>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-primary"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}
                >
                  $0
                </span>
                <span className="text-ui-label-caps text-on-surface-variant">/ FOREVER</span>
              </div>
            </div>
            <ul className="space-y-4 mb-stack-gap-lg flex-grow">
              <li className="flex items-start gap-2 text-ui-body text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                Limited daily generates
              </li>
              <li className="flex items-start gap-2 text-ui-body text-on-surface-variant/60">
                <span className="material-symbols-outlined text-outline text-sm mt-1">block</span>
                No consultant access
              </li>
              <li className="flex items-start gap-2 text-ui-body text-on-surface-variant/60">
                <span className="material-symbols-outlined text-outline text-sm mt-1">block</span>
                No community features
              </li>
            </ul>
            <button
              className="w-full py-4 px-stack-gap-md bg-outline-variant/20 text-on-surface font-button-text text-button-text rounded-full hover:bg-outline-variant/40 transition-all active:scale-95"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Current Path
            </button>
          </div>

          {/* Soul Seeker Tier */}
          <div
            ref={(el) => { cardRefs.current[1] = el }}
            data-index={1}
            className="bg-surface-container-lowest p-stack-gap-md rounded-xl border-2 border-secondary relative overflow-hidden flex flex-col h-full transition-all duration-700"
            style={{
              boxShadow: '0 25px 50px rgba(115,92,0,0.12)',
              opacity: visibleCards[1] ? 1 : 0,
              transform: visibleCards[1] ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <div className="absolute top-4 right-4">
              <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
                RECOMMENDED
              </span>
            </div>
            <div className="mb-stack-gap-md relative z-10">
              <h3 className="font-ui-label-caps text-ui-label-caps text-secondary mb-unit">
                SOUL SEEKER
              </h3>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-primary"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}
                >
                  $2
                </span>
                <span className="text-ui-label-caps text-on-surface-variant">/ YEAR</span>
              </div>
            </div>
            <ul className="space-y-4 mb-stack-gap-lg flex-grow relative z-10">
              <li className="flex items-start gap-2 text-ui-body text-on-surface font-semibold">
                <span
                  className="material-symbols-outlined text-secondary text-sm mt-1"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                Unlimited daily generates
              </li>
              <li className="flex items-start gap-2 text-ui-body text-on-surface">
                <span className="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>
                Direct consultant access
              </li>
              <li className="flex items-start gap-2 text-ui-body text-on-surface">
                <span className="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>
                Community network access
              </li>
            </ul>
            <button
              className="w-full py-4 px-stack-gap-md bg-secondary text-on-secondary font-button-text text-button-text rounded-full hover:bg-on-secondary-fixed-variant transition-all shadow-lg active:scale-95 relative z-10"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Begin Enlightenment
            </button>
          </div>
        </section>

        {/* Feature Spotlight */}
        <section className="max-w-max-content-width mx-auto px-container-padding mt-stack-gap-lg">
          <div
            className="rounded-xl p-stack-gap-md text-on-primary-container flex flex-col md:flex-row items-center gap-stack-gap-md"
            style={{
              background: 'var(--color-primary-container)',
              boxShadow: '0 10px 30px rgba(6,78,59,0.15)',
            }}
          >
            <div className="flex-1">
              <h4
                className="text-on-primary mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}
              >
                Speak with Wisdom
              </h4>
              <p className="text-ui-body opacity-90 leading-relaxed mb-4" style={{ fontSize: 16 }}>
                Soul Seeker members get exclusive access to our certified spiritual consultants
                for deep, private conversations on faith and growth.
              </p>
              <div className="flex gap-2">
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCmLhzn75IXeFubRyuEF0zewAr1-iL6EYgpMmmZCniCln0hIjuo2zttSDfZCoynP698Dpp0M3yt54REsQUE_AzKMPCTKIW1-ryy6WhAN5FqNdUaRYuEHzhdrOR6310MOYji6DdRZ7oexVFr-wC4riQbwayuhRxsDQMcT9vkscQPCrUXULhsXr-0ZFESL86JZzZS7kxABPTFwNfgGhUG50NrTfmEx_P_N0KO7ML-4wgOjT8RQc8CnYEj5rsa40PBpW0Cesq3dA4v_Ysl',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAr7wHrZDfXwmvA1YdSqptoF8emwDTEeOTwhxC6q0SzNGNspf1Z-1c8fZfZPe9JUPUAxGwppDYtQ4fpgN2NPy0-W_XEK1mUigJyYXTYYi-tiNUZbPHt6n2lim54P0nMjqF9ZTAyMtTAkP1FAD8FipfTiZkxZgszWHBlz0padHypGt0cdMcipV1A9LWkF1JabXqe3TC1W7ryaiLaWnkYKYNX7NjczRprWnCDwmuujA8RmpsXO42ryQQomoF3PyXh1KeF_WOj2Z9PyRRu',
                ].map((src, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 overflow-hidden"
                    style={{ borderColor: 'var(--color-on-primary-container)', marginLeft: i > 0 ? -16 : 0 }}
                  >
                    <img
                      src={src}
                      alt="Consultant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    borderColor: 'var(--color-on-primary-container)',
                    background: 'rgba(176,240,214,0.2)',
                    marginLeft: -16,
                  }}
                >
                  +12
                </div>
              </div>
            </div>
            <div
              className="p-stack-gap-sm rounded-lg backdrop-blur-sm border border-white/10 flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-[10px] font-ui-label-caps uppercase tracking-widest">Live Now</span>
              </div>
              <div
                className="text-xs italic opacity-80"
                style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}
              >
                "How can I apply patience in today's digital chaos?"
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-stack-gap-md mt-auto bg-surface-container-low text-center">
        <div className="flex flex-col items-center gap-unit px-container-padding max-w-[1200px] mx-auto">
          <span
            className="text-secondary"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}
          >
            JAWAB RASA
          </span>
          <div className="flex gap-stack-gap-md flex-wrap justify-center mb-unit">
            {['Privacy', 'Terms', 'Support', 'Consultants'].map((link) => (
              <a
                key={link}
                href="#"
                className="font-ui-label-caps text-ui-label-caps text-on-surface-variant opacity-70 hover:text-primary transition-opacity"
              >
                {link}
              </a>
            ))}
          </div>
          <p className="font-ui-label-caps text-ui-label-caps text-secondary opacity-80">
            © 2024 JAWAB RASA. Seek your light.
          </p>
        </div>
      </footer>
    </div>
  )
}
