/**
 * ReflectPage — Full reflection history for the user.
 *
 * Shows all past verse reflections with search, mood filter,
 * and detailed cards including Arabic text, translation, tags, and date.
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/* ── Types ── */
interface Reflection {
  id: number
  arabic: string
  translation: string
  reference: string
  mood: string
  tags: string[]
  createdAt: string
  dateLabel: string
}

/* ── Sample data ── */
const REFLECTIONS: Reflection[] = [
  {
    id: 1,
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: '"For indeed, with hardship [will be] ease."',
    reference: 'Surah Ash-Sharh 94:5',
    mood: 'Anxious',
    tags: ['Patience', 'Hope'],
    createdAt: '2026-07-17T09:30:00Z',
    dateLabel: 'Today',
  },
  {
    id: 2,
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
    translation: '"So remember Me; I will remember you."',
    reference: 'Surah Al-Baqarah 2:152',
    mood: 'Grateful',
    tags: ['Gratitude', 'Remembrance'],
    createdAt: '2026-07-16T20:15:00Z',
    dateLabel: 'Yesterday',
  },
  {
    id: 3,
    arabic: 'وَلَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
    translation: '"Do not grieve; indeed Allah is with us."',
    reference: 'Surah At-Tawbah 9:40',
    mood: 'Sad',
    tags: ['Comfort', 'Faith'],
    createdAt: '2026-07-16T14:00:00Z',
    dateLabel: 'Yesterday',
  },
  {
    id: 4,
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا',
    translation: '"Our Lord, pour upon us patience."',
    reference: 'Surah Al-Baqarah 2:250',
    mood: 'Anxious',
    tags: ['Patience', 'Strength'],
    createdAt: '2026-07-15T11:45:00Z',
    dateLabel: '2 days ago',
  },
  {
    id: 5,
    arabic: 'يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ',
    translation: '"Allah intends for you ease and does not intend for you hardship."',
    reference: 'Surah Al-Baqarah 2:185',
    mood: 'Peaceful',
    tags: ['Mercy', 'Ease'],
    createdAt: '2026-07-14T19:30:00Z',
    dateLabel: '3 days ago',
  },
  {
    id: 6,
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: '"And whoever relies upon Allah — He is sufficient for them."',
    reference: 'Surah At-Talaq 65:3',
    mood: 'Lost',
    tags: ['Tawakkul', 'Trust'],
    createdAt: '2026-07-13T08:00:00Z',
    dateLabel: '4 days ago',
  },
  {
    id: 7,
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: '"Indeed, with hardship [comes] ease."',
    reference: 'Surah Ash-Sharh 94:6',
    mood: 'Sad',
    tags: ['Hope', 'Resilience'],
    createdAt: '2026-07-12T22:10:00Z',
    dateLabel: '5 days ago',
  },
  {
    id: 8,
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: '"Allah does not burden a soul beyond that it can bear."',
    reference: 'Surah Al-Baqarah 2:286',
    mood: 'Anxious',
    tags: ['Strength', 'Faith'],
    createdAt: '2026-07-11T16:20:00Z',
    dateLabel: '6 days ago',
  },
  {
    id: 9,
    arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    translation: '"And your Lord is going to give you, and you will be satisfied."',
    reference: 'Surah Ad-Duhaa 93:5',
    mood: 'Happy',
    tags: ['Gratitude', 'Contentment'],
    createdAt: '2026-07-10T13:00:00Z',
    dateLabel: '1 week ago',
  },
  {
    id: 10,
    arabic: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا',
    translation: '"And you have not been given of knowledge except a little."',
    reference: "Surah Al-Isra' 17:85",
    mood: 'Peaceful',
    tags: ['Knowledge', 'Humility'],
    createdAt: '2026-07-09T10:30:00Z',
    dateLabel: '1 week ago',
  },
  {
    id: 11,
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي',
    translation: '"My Lord, expand for me my breast [with assurance]."',
    reference: 'Surah Ta-Ha 20:25',
    mood: 'Lost',
    tags: ['Guidance', 'Dua'],
    createdAt: '2026-07-07T07:45:00Z',
    dateLabel: '1 week ago',
  },
  {
    id: 12,
    arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
    translation: '"So whoever does an atom\'s weight of good will see it."',
    reference: 'Surah Az-Zalzalah 99:7',
    mood: 'Grateful',
    tags: ['Hope', 'Deeds'],
    createdAt: '2026-07-05T18:00:00Z',
    dateLabel: '2 weeks ago',
  },
]

const ALL_MOODS = Array.from(new Set(REFLECTIONS.map((r) => r.mood)))

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
  const { signOut } = useAuthContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const filtered = useMemo(() => {
    let list = [...REFLECTIONS]

    // Mood filter
    if (moodFilter) {
      list = list.filter((r) => r.mood === moodFilter)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          r.translation.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Sort
    list.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? -diff : diff
    })

    return list
  }, [searchQuery, moodFilter, sortOrder])

  /* ── Group by date label ── */
  const grouped = useMemo(() => {
    const map = new Map<string, Reflection[]>()
    for (const r of filtered) {
      const group = map.get(r.dateLabel) ?? []
      group.push(r)
      map.set(r.dateLabel, group)
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
            <button
              className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200"
              onClick={signOut}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title="Account"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
              >
                account_circle
              </span>
            </button>
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

              {/* Summary badge */}
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="text-[11px] font-semibold bg-primary-fixed/20 text-primary px-3 py-1 rounded-full">
                  {REFLECTIONS.length} total
                </span>
                <span className="text-[11px] font-semibold bg-secondary/5 text-secondary px-3 py-1 rounded-full">
                  {ALL_MOODS.length} moods
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
                placeholder="Search verses, topics, or references..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-colors"
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            {/* Mood filter */}
            <div className="flex gap-2 flex-wrap">
              {ALL_MOODS.map((mood) => (
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

          {/* ── Reflection list ── */}
          {filtered.length === 0 ? (
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
                    {items.map((reflection) => (
                      <div
                        key={reflection.id}
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
                              {reflection.mood}
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
                            {reflection.arabic}
                          </p>
                        </div>

                        {/* Translation + meta */}
                        <div className="px-5 py-3">
                          <p
                            className="text-on-surface italic line-clamp-2 leading-relaxed mb-2"
                            style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, fontWeight: 300 }}
                          >
                            {reflection.translation}
                          </p>
                          <div className="flex justify-between items-center">
                            <span
                              className="text-on-surface-variant/60"
                              style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}
                            >
                              {reflection.reference}
                            </span>
                            <div className="flex gap-1">
                              {reflection.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: 'var(--color-secondary)',
                                    background: 'rgba(115,92,0,0.06)',
                                    border: '1px solid rgba(115,92,0,0.1)',
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
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
