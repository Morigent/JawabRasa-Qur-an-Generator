/**
 * ReflectPage — Full reflection history from the database.
 *
 * Fetches real user_ayat_history data from /api/history, with
 * verse text enriched from the Quran API on the server side.
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@jawabrasa/shared'
import ProfileDropdown from '../components/ProfileDropdown'

/* ── Types ── */
interface HistoryEntry {
  id: number
  mood: string
  reference: string
  surah_number: number
  ayat_number: number
  arabic_text: string
  translation: string
  created_at: string
}

function formatDateLabel(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays} days ago`
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} week(s) ago`
  return `${Math.floor(diffDays / 30)} month(s) ago`
}

const TOP_NAV = [
  { label: 'Home',    path: '/dashboard' },
  { label: 'Reflect', path: '/reflect' },
  { label: 'Inbox',   path: '/inbox' },
]

const BOTTOM_NAV = [
  { label: 'Home',    icon: 'auto_awesome', active: false, path: '/dashboard' },
  { label: 'Reflect', icon: 'menu_book',    active: true,  path: '/reflect' },
  { label: 'Inbox',   icon: 'chat_bubble',  active: false, path: '/inbox' },
  { label: 'Profile', icon: 'person',       active: false, path: '#' },
]

/* ══════════════════════════════════════════════════════════
   ReflectPage
   ══════════════════════════════════════════════════════════ */
export default function ReflectPage() {
  const navigate = useNavigate()

  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  /* ── Fetch real history from API ── */
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token
        if (!token) {
          setLoading(false)
          return
        }
        const res = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const json = await res.json()
        if (!cancelled) setEntries(json.entries ?? [])
      } catch (err) {
        console.error('[ReflectPage] Failed to load history:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  /* ── Moods derived from real data ── */
  const allMoods = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.mood)))
  }, [entries])

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = [...entries]

    if (moodFilter) {
      list = list.filter((e) => e.mood === moodFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.translation.toLowerCase().includes(q) ||
          e.reference.toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? -diff : diff
    })

    return list
  }, [entries, searchQuery, moodFilter, sortOrder])

  /* ── Group by date label ── */
  const grouped = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>()
    for (const r of filtered) {
      const label = formatDateLabel(r.created_at)
      const group = map.get(label) ?? []
      group.push(r)
      map.set(label, group)
    }
    return map
  }, [filtered])

  return (
    <div className="bg-background text-on-surface font-ui-body antialiased min-h-screen flex flex-col">
      <title>JAWAB RASA — My Reflections</title>

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div
          className="flex justify-between items-center px-container-padding py-unit mx-auto"
          style={{ maxWidth: 1440 }}
        >
          <span
            className="text-primary tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, cursor: 'pointer' }}
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
                  color: item.path === '/reflect' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                }}
                onMouseEnter={(e) => { if (item.path !== '/reflect') e.currentTarget.style.color = 'var(--color-primary)' }}
                onMouseLeave={(e) => { if (item.path !== '/reflect') e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
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

      {/* ── Layout ── */}
      <div className="flex flex-1 pt-16 pb-16 md:pb-0 max-w-[1440px] mx-auto w-full px-4 md:px-8 gap-8">
        <main className="flex-1 w-full pt-stack-gap-md pb-stack-gap-lg">

          {/* Page header */}
          <header className="mb-stack-gap-md">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h2
                  className="text-primary"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.4 }}
                >
                  My Reflections
                </h2>
                <p className="text-on-surface-variant opacity-80 mt-1 font-ui-body" style={{ fontSize: 16 }}>
                  Your journey through the verses that spoke to your heart.
                </p>
              </div>

              {/* Summary badge — real counts */}
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="text-[11px] font-semibold bg-primary-fixed/20 text-primary px-3 py-1 rounded-full">
                  {entries.length} total
                </span>
                <span className="text-[11px] font-semibold bg-secondary/5 text-secondary px-3 py-1 rounded-full">
                  {allMoods.length} moods
                </span>
              </div>
            </div>
          </header>

          {/* ── Search & Filters ── */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                style={{ fontSize: 20, color: 'rgba(64,73,68,0.4)' }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search verses or references..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-colors"
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            {/* Mood filter */}
            <div className="flex gap-2 flex-wrap">
              {allMoods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all active:scale-95"
                  style={{
                    fontFamily: 'Inter',
                    background: moodFilter === mood ? 'var(--color-primary)' : 'rgba(115,92,0,0.08)',
                    color: moodFilter === mood ? 'white' : 'var(--color-secondary)',
                    border: moodFilter === mood ? 'none' : '1px solid rgba(115,92,0,0.15)',
                  }}
                >
                  {mood}
                </button>
              ))}
              <button
                onClick={() => { setSortOrder((s) => s === 'newest' ? 'oldest' : 'newest') }}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95"
                style={{
                  fontFamily: 'Inter',
                  background: 'rgba(64,73,68,0.06)',
                  color: 'var(--color-on-surface-variant)',
                  border: '1px solid rgba(64,73,68,0.12)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {sortOrder === 'newest' ? 'expand_more' : 'expand_less'}
                </span>
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </button>
            </div>
          </div>

          {/* ── Loading state ── */}
          {loading ? (
            <div className="text-center py-20">
              <span
                className="material-symbols-outlined block mx-auto mb-4 animate-spin"
                style={{ fontSize: 48, color: 'rgba(64,73,68,0.2)' }}
              >
                progress_activity
              </span>
              <p className="text-on-surface-variant/50" style={{ fontFamily: 'Inter', fontSize: 14 }}>
                Loading your reflections...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <span
                className="material-symbols-outlined block mx-auto mb-4"
                style={{ fontSize: 48, color: 'rgba(64,73,68,0.2)' }}
              >
                auto_stories
              </span>
              <p className="text-on-surface-variant/50" style={{ fontFamily: 'Inter', fontSize: 14 }}>
                {searchQuery || moodFilter
                  ? 'No reflections match your filters.'
                  : 'No reflections yet. Start by selecting your mood on the dashboard.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(grouped.entries()).map(([label, items]) => (
                <section key={label}>
                  <h3
                    className="text-on-surface-variant/50 mb-3"
                    style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  >
                    {label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Arabic verse */}
                        <div className="p-5 pb-3 border-b border-outline-variant/10">
                          <div className="flex justify-between items-start mb-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                              style={{
                                color: 'var(--color-secondary-fixed-dim)',
                                background: 'rgba(115,92,0,0.1)',
                              }}
                            >
                              {entry.mood}
                            </span>
                            <span
                              className="material-symbols-outlined text-secondary/40 hover:text-secondary transition-colors cursor-pointer"
                              style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                            >
                              bookmark
                            </span>
                          </div>
                          <p
                            className="text-on-surface text-right leading-relaxed mb-1"
                            style={{ fontFamily: "'Amiri', serif", fontSize: 22, direction: 'rtl' }}
                          >
                            {entry.arabic_text || ''}
                          </p>
                        </div>

                        {/* Translation + meta */}
                        <div className="px-5 py-3">
                          <p
                            className="text-on-surface italic line-clamp-2 leading-relaxed mb-2"
                            style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, fontWeight: 300 }}
                          >
                            {entry.translation || '(Verse text unavailable)'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span
                              className="text-on-surface-variant/60"
                              style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}
                            >
                              {entry.reference}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface border-t border-outline-variant/30 shadow-[0_-10px_30px_rgba(6,78,59,0.05)]">
        <div className="flex justify-around items-center h-16 w-full px-4 pb-safe">
          {BOTTOM_NAV.map((item) => (
            <button
              key={item.label}
              onClick={() => { if (item.path !== '#') navigate(item.path) }}
              className={`flex flex-col items-center justify-center transition-all duration-300 px-4 py-1 rounded-full ${
                item.active
                  ? 'text-primary font-semibold bg-primary-fixed/20'
                  : 'text-on-surface-variant opacity-70'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: item.active ? '"FILL" 1' : '"FILL" 0' }}
              >
                {item.icon}
              </span>
              <span className="font-ui-label-caps text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Footer ── */}
      <footer className="w-full py-stack-gap-md mt-auto bg-surface-container-low border-t border-outline-variant/10">
        <div className="flex flex-col items-center gap-unit px-container-padding max-w-[1440px] mx-auto text-center">
          <span
            className="text-secondary mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}
          >
            JAWAB RASA
          </span>
          <div className="flex gap-4 mb-4 flex-wrap justify-center">
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
          <p className="font-ui-label-caps text-ui-label-caps text-secondary opacity-60">
            © 2024 JAWAB RASA. Seek your light.
          </p>
        </div>
      </footer>
    </div>
  )
}
