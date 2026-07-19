/**
 * LandingPage — JAWAB RASA home screen
 *
 * Converted from the provided HTML prototype into React + Tailwind v4.
 * Interaction: clicking the envelope or "Reveal Your Reflection" button
 * fades out the hero trigger and reveals the verse card with its bento grid.
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ── Sample verse data (will be replaced by API data) ── */
const VERSES = [
  {
    surah: 'SURAH AL-BAQARAH 2:153',
    tags: ['PATIENCE', 'PRAYER'],
    arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
    text: '"O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient."',
  },
  {
    surah: 'SURAH ASH-SHARH 94:5-6',
    tags: ['HOPE', 'EASE'],
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    text: '"For indeed, with hardship will be ease. Indeed, with hardship will be ease."',
  },
  {
    surah: 'SURAH AL-IMRAN 3:139',
    tags: ['COURAGE', 'FAITH'],
    arabic: 'وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    text: '"Do not be weak, and do not grieve — you will be superior if you are true believers."',
  },
  {
    surah: "SURAH AR-RA'D 13:28",
    tags: ['PEACE', 'REMEMBRANCE'],
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    text: '"Verily, in the remembrance of Allah do hearts find rest."',
  },
]

/* ── Envelope / Hero trigger ── */
function EnvelopeTrigger({ onClick, small = false }: { onClick: () => void; small?: boolean }) {
  const size = small ? 'w-28 h-20' : 'w-48 h-32'
  return (
    <div
      id="reflection-trigger"
      className={`relative group cursor-pointer ${small ? 'mb-4' : 'mb-stack-gap-lg'} envelope-shake transition-all duration-500`}
      onClick={onClick}
      role="button"
      aria-label="Reveal your daily reflection"
    >
      <div
        className={`${size} bg-surface-container-lowest rounded-lg border border-outline-variant/30 relative flex items-center justify-center overflow-hidden`}
        style={{ boxShadow: '0 10px 30px rgba(6,78,59,0.05)' }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest to-surface-container-low opacity-50" />

        <div className={`z-10 ${small ? 'w-8 h-8' : 'w-12 h-12'} bg-secondary-container rounded-full flex items-center justify-center border border-secondary/20`}
          style={{ boxShadow: '0 4px 12px rgba(115,92,0,0.15)' }}
        >
          <span
            className={`material-symbols-outlined text-secondary ${small ? 'text-lg' : 'text-2xl'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary/30 rounded-tl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary/30 rounded-br-lg" />
      </div>
    </div>
  )
}

/* ── Verse card (revealed after click) ── */
function ReflectionArea({ verse }: { verse: typeof VERSES[0] }) {
  return (
    <section id="reflection-area" className="w-full reveal-animation">
      {/* Main verse card */}
      <div
        className="landing-card p-stack-gap-md border-t-2 border-secondary-container relative overflow-hidden"
      >
        {/* Golden glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/10 blur-3xl -mr-12 -mt-12 rounded-full pointer-events-none" />

        <div className="space-y-stack-gap-md relative z-10">
          {/* Header row */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span
              className="font-ui-label-caps text-secondary tracking-widest"
              style={{ fontSize: 12, letterSpacing: '0.1em', fontWeight: 600 }}
            >
              {verse.surah}
            </span>
            <div className="flex gap-2">
              {verse.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-secondary-container/20 text-secondary rounded-full"
                  style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'Inter' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Arabic text */}
          <p
            className="text-primary text-center leading-loose"
            style={{
              fontFamily: "'Amiri', 'Scheherazade New', serif",
              fontSize: 28,
              lineHeight: 2,
              direction: 'rtl',
              letterSpacing: 0,
              borderBottom: '1px solid rgba(192,201,192,0.3)',
              paddingBottom: '1rem',
              marginBottom: '0.25rem',
            }}
          >
            {verse.arabic}
          </p>

          {/* Translation text */}
          <p
            className="text-primary leading-relaxed"
            style={{ fontFamily: "'Roboto', sans-serif", fontSize: 20, lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic' }}
          >
            {verse.text}
          </p>

          {/* Action row */}
          <div className="pt-stack-gap-sm border-t border-outline-variant/30 flex justify-between items-center">
            <button
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200"
              style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
              Write Reflection
            </button>
            <div className="flex gap-stack-gap-sm">
              <button
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200"
                style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Share"
              >
                share
              </button>
              <button
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200"
                style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Bookmark"
              >
                bookmark
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

/* ── Feature list ── */
const FEATURES = [
  {
    icon: 'psychology',
    iconBg: 'bg-primary-fixed/30',
    iconColor: 'text-primary',
    title: 'Cognitive Serenity',
    body: 'JAWAB RASA filters out the noise of the digital world, presenting one profound truth at a time to encourage deep, meaningful introspection.',
  },
  {
    icon: 'stylus_note',
    iconBg: 'bg-secondary-container/20',
    iconColor: 'text-secondary',
    title: 'Tactile Experience',
    body: 'Our interface mimics the warmth of vellum and gold-leaf, turning every interaction into a moment of digital craftsmanship.',
  },
]

/* ══════════════════════════════════════════════════════════
   Landing Page
   ══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useEffect(() => { console.log('[Page] LandingPage mounted') }, [])
  const [verseIndex, setVerseIndex] = useState(-1)
  const reflectionRef = useRef<HTMLDivElement>(null)

  const revealed = verseIndex >= 0
  const currentVerse = revealed ? VERSES[verseIndex % VERSES.length] : null

  /* Intersection Observer — reveal sections on scroll */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-animation')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active')
        })
      },
      { threshold: 0.1 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [revealed]) // re-run when content appears

  function handleReveal() {
    setVerseIndex((i) => i + 1)
    /* Scroll to card on first reveal */
    requestAnimationFrame(() => {
      setTimeout(() => {
        reflectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    })
  }

  return (
    <>
      <title>JAWAB RASA — Your Morning Light</title>
      <meta name="description" content="Receive a daily verse from the Quran, curated for your moment of reflection." />

      <div className="font-ui-body text-on-background min-h-screen flex flex-col bg-surface">

        {/* ── Top App Bar ── */}
        <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
          <div
            className="flex justify-between items-center px-container-padding py-unit mx-auto"
            style={{ maxWidth: 640 }}
          >
            <h1
              className="text-primary tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, margin: 0 }}
            >
              JAWAB RASA
            </h1>
            <div className="flex gap-stack-gap-sm items-center">
              <button
                className="material-symbols-outlined text-primary p-2 hover:bg-primary-fixed/20 rounded-full transition-colors active:scale-95 duration-200"
                title="History"
                style={{ fontSize: 22 }}
              >
                history
              </button>
              <Link
                to="/login"
                className="material-symbols-outlined text-primary p-2 hover:bg-primary-fixed/20 rounded-full transition-colors active:scale-95 duration-200"
                title="Sign In"
                style={{ fontSize: 22 }}
              >
                account_circle
              </Link>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main
          className="flex-grow pt-24 pb-stack-gap-lg px-container-padding mx-auto w-full flex flex-col items-center"
          style={{ maxWidth: 640 }}
        >

          {/* ── Hero Section ── */}
          <section
            className="w-full text-center py-stack-gap-lg reveal-animation active flex flex-col items-center"
            style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            {/* Envelope — shrinks after first reveal */}
            <EnvelopeTrigger onClick={handleReveal} small={revealed} />

            {!revealed ? (
              /* ── Pre-reveal state ── */
              <>
                <div className="space-y-stack-gap-sm mb-stack-gap-md">
                  <h2
                    className="text-primary"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(24px, 5vw, 32px)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.4,
                    }}
                  >
                    Your Morning Light
                  </h2>
                  <p className="text-on-surface-variant max-w-sm mx-auto" style={{ fontFamily: 'Inter', fontSize: 16, lineHeight: 1.5 }}>
                    Receive a daily verse from the Quran, curated for your moment of reflection.
                  </p>
                </div>

                <button
                  id="reveal-btn"
                  onClick={handleReveal}
                  className="bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 duration-200"
                  style={{
                    padding: '1rem 2.5rem',
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                >
                  Reveal Your Reflection
                </button>
              </>
            ) : (
              /* ── Post-reveal state ── */
              <>
                <p
                  className="text-on-surface-variant mb-3"
                  style={{ fontFamily: 'Inter', fontSize: 13, lineHeight: 1.5 }}
                >
                  Verse {(verseIndex % VERSES.length) + 1} of {VERSES.length}
                </p>
                <button
                  id="reveal-another-btn"
                  onClick={handleReveal}
                  className="bg-surface-container text-primary rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 flex items-center gap-2"
                  style={{
                    padding: '0.65rem 1.5rem',
                    fontFamily: 'Inter',
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid rgba(192,201,192,0.4)',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>autorenew</span>
                  Reveal Another
                </button>
              </>
            )}
          </section>

          {/* ── Reflection Area (shown after reveal) ── */}
          {revealed && currentVerse && (
            <div ref={reflectionRef} className="w-full">
              <ReflectionArea verse={currentVerse} />
            </div>
          )}

          {/* ── The Concept ── */}
          <section className="w-full mt-stack-gap-lg pt-stack-gap-lg border-t border-outline-variant/20 reveal-animation">
            <div className="text-center mb-stack-gap-md">
              <span
                className="text-secondary tracking-widest uppercase"
                style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em' }}
              >
                The Concept
              </span>
            </div>

            <div className="space-y-stack-gap-md">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-stack-gap-md">
                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${f.iconBg}`}
                  >
                    <span className={`material-symbols-outlined ${f.iconColor}`} style={{ fontSize: 22 }}>
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-primary mb-1"
                      style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 1.6 }}>
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="w-full py-stack-gap-md mt-auto bg-surface-container-low">
          <div
            className="flex flex-col items-center gap-unit px-container-padding mx-auto text-center"
            style={{ maxWidth: 640 }}
          >
            <h2
              className="text-secondary"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}
            >
              JAWAB RASA
            </h2>
            <div className="flex gap-4 mb-2 flex-wrap justify-center">
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
              className="text-secondary opacity-80"
              style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em' }}
            >
              © 2024 JAWAB RASA. Seek your light.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
