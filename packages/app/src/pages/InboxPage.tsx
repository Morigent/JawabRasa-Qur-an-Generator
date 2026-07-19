/**
 * InboxPage — Consultant-side "Active Sessions" view.
 *
 * Shows a high-density table of active client sessions with:
 *  - Client avatar, name, and plan
 *  - Online/Away status
 *  - Current reflection verse snippet
 *  - Mood tags
 *  - Chat action button
 *
 * Designed for consultants managing multiple clients at once.
 */

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileDropdown from '../components/ProfileDropdown'

/* ── Types ── */
type Status = 'online' | 'away' | 'offline'

interface Client {
  id: number
  name: string
  plan: 'Premium Plan' | 'Standard Plan'
  avatar: string
  status: Status
  awayTime?: string
  verse: string
  reference: string
  tags: string[]
}

/* ── Sample data ── */
const CLIENTS: Client[] = [
  {
    id: 1,
    name: 'Amira Khalid',
    plan: 'Premium Plan',
    avatar: '/client_amira.png',
    status: 'online',
    verse: '"Then which of the favors of your Lord will you deny?"',
    reference: '55:13',
    tags: ['Gratitude', 'Nature'],
  },
  {
    id: 2,
    name: 'Dr. Omar Farooq',
    plan: 'Standard Plan',
    avatar: '/consultant_omar.png',
    status: 'away',
    awayTime: '15m',
    verse: '"Indeed, with hardship [will be] ease."',
    reference: '94:6',
    tags: ['Patience', 'Resilience'],
  },
  {
    id: 3,
    name: 'Yusuf Chen',
    plan: 'Premium Plan',
    avatar: '/client_yusuf.png',
    status: 'online',
    verse: '"He found you lost and guided [you]."',
    reference: '93:7',
    tags: ['Guidance'],
  },
  {
    id: 4,
    name: 'Sarah Al-Zahrani',
    plan: 'Premium Plan',
    avatar: '/consultant_sarah.png',
    status: 'offline',
    verse: '"My mercy encompasses all things."',
    reference: '7:156',
    tags: ['Mercy', 'Hope'],
  },
  {
    id: 5,
    name: 'Ibrahim Hassan',
    plan: 'Standard Plan',
    avatar: '/client_amira.png',
    status: 'online',
    verse: '"Allah does not burden a soul beyond that it can bear."',
    reference: '2:286',
    tags: ['Patience', 'Strength'],
  },
]

const NAV_ITEMS = [
  { label: 'Clients', icon: 'group', active: true },
  { label: 'Requests', icon: 'person_add', active: false },
  { label: 'Inbox', icon: 'chat_bubble', active: false },
  { label: 'Profile', icon: 'person', active: false },
]

const TOP_NAV = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Reflect', path: '#' },
  { label: 'Inbox', path: '/inbox' },
]

/* ── Status dot ── */
function StatusDot({ status }: { status: Status }) {
  const color =
    status === 'online' ? 'bg-green-500' :
      status === 'away' ? 'bg-amber-500' :
        'bg-on-surface-variant/40'

  return <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${color}`} />
}

/* ── Status badge ── */
function StatusBadge({ status, awayTime }: { status: Status; awayTime?: string }) {
  if (status === 'online') {
    return (
      <span className={clsx('inline-flex', 'items-center', 'gap-1', 'text-[11px]', 'font-semibold', 'text-green-600', 'bg-green-50', 'px-2', 'py-0.5', 'rounded-full', 'border', 'border-green-100')}>
        <span className={clsx('w-1', 'h-1', 'rounded-full', 'bg-green-600')} />
        Online
      </span>
    )
  }
  if (status === 'away') {
    return (
      <span className={clsx('text-[11px]', 'font-medium', 'text-on-surface-variant/60')}>
        Away ({awayTime ?? '…'})
      </span>
    )
  }
  return (
    <span className={clsx('text-[11px]', 'font-medium', 'text-on-surface-variant/40')}>
      Offline
    </span>
  )
}

/* ══════════════════════════════════════════════════════════
   InboxPage
   ══════════════════════════════════════════════════════════ */
export default function InboxPage() {
  useEffect(() => { console.log('[Page] InboxPage mounted') }, [])
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const totalClients = 42

  return (
    <div className={clsx('bg-background', 'text-on-surface', 'font-ui-body', 'antialiased', 'min-h-screen', 'flex', 'flex-col')}>
      <title>JAWAB RASA — Active Sessions</title>

      {/* ── Top App Bar ── */}
      <header className={clsx('fixed', 'top-0', 'w-full', 'z-50', 'bg-surface/80', 'backdrop-blur-md', 'shadow-sm')}>
        <div
          className={clsx('flex', 'justify-between', 'items-center', 'px-container-padding', 'py-unit', 'mx-auto')}
          style={{ maxWidth: 1440 }}
        >
          <span
            className={clsx('text-primary', 'tracking-tight')}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            JAWAB RASA
          </span>

          {/* Desktop nav */}
          <nav className={clsx('hidden', 'md:flex', 'gap-stack-gap-md', 'items-center')}>
            {TOP_NAV.map((item) => (
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
                  color: item.path === '/inbox' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                }}
                onMouseEnter={(e) => { if (item.path !== '/inbox') e.currentTarget.style.color = 'var(--color-primary)' }}
                onMouseLeave={(e) => { if (item.path !== '/inbox') e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
              >
                {item.label.toUpperCase()}
              </a>
            ))}
          </nav>

          {/* Icon actions */}
          <div className={clsx('flex', 'items-center', 'gap-4')}>
            <button
              className={clsx('text-on-surface-variant', 'hover:text-primary', 'transition-colors', 'active:scale-95', 'duration-200')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title="History"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>history</span>
            </button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* ── Layout wrapper ── */}
      <div className={clsx('flex', 'flex-1', 'pt-16', 'pb-16', 'md:pb-0', 'max-w-[1440px]', 'mx-auto', 'w-full', 'px-4', 'md:px-8', 'gap-8')}>
        {/* ── Main content ── */}
        <main className={clsx('flex-1', 'w-full', 'pt-stack-gap-md', 'pb-stack-gap-lg', 'overflow-hidden')}>
          <header className="mb-stack-gap-md">
            <div className={clsx('flex', 'justify-between', 'items-end')}>
              <div>
                <h2
                  className="text-primary"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.4 }}
                >
                  Active Sessions
                </h2>
                <p className={clsx('text-on-surface-variant', 'opacity-80', 'mt-1', 'font-ui-body')} style={{ fontSize: 16 }}>
                  Professional management for high-volume guidance.
                </p>
              </div>
            </div>
          </header>

          {/* ── Table card ── */}
          <div className={clsx('rounded-xl', 'border', 'border-outline-variant/30', 'shadow-sm', 'overflow-hidden', 'bg-surface/90', 'backdrop-blur-sm')}>
            <div className="overflow-x-auto">
              <table className={clsx('w-full', 'text-left', 'border-collapse')}>
                <thead>
                  <tr className={clsx('bg-surface-container-low/50', 'border-b', 'border-outline-variant/20')}>
                    {['Client', 'Status', 'Current Reflection', 'Mood Tags', 'Action'].map((col, i) => (
                      <th
                        key={col}
                        className={`px-6 py-4 font-ui-label-caps text-ui-label-caps text-on-surface-variant opacity-60 ${i === 4 ? 'text-right' : ''}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={clsx('divide-y', 'divide-outline-variant/10')}>
                  {CLIENTS.map((client) => (
                    <tr
                      key={client.id}
                      className={clsx('transition-colors', 'hover:bg-surface-container-low/40')}
                    >
                      {/* Client */}
                      <td className={clsx('px-6', 'py-4')}>
                        <div className={clsx('flex', 'items-center', 'gap-3')}>
                          <div className="relative">
                            <img
                              src={client.avatar}
                              alt={client.name}
                              className={clsx('w-10', 'h-10', 'rounded-full', 'object-cover', 'border', 'border-outline-variant/20')}
                            />
                            <StatusDot status={client.status} />
                          </div>
                          <div>
                            <div className={clsx('font-button-text', 'text-on-surface', 'font-semibold')}>
                              {client.name}
                            </div>
                            <div className={clsx('text-[10px]', 'text-on-surface-variant', 'opacity-60', 'uppercase', 'tracking-tighter')}>
                              {client.plan}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className={clsx('px-6', 'py-4')}>
                        <StatusBadge status={client.status} awayTime={client.awayTime} />
                      </td>

                      {/* Current Reflection */}
                      <td className={clsx('px-6', 'py-4', 'max-w-xs')}>
                        <p
                          className={`text-sm italic line-clamp-1 leading-relaxed ${client.status === 'offline'
                            ? 'text-on-surface-variant/50'
                            : 'text-on-surface-variant'
                            }`}
                        >
                          {client.verse}
                        </p>
                        <span
                          className={`text-[10px] font-ui-label-caps ${client.status === 'offline'
                            ? 'text-on-surface-variant/30'
                            : 'text-on-surface-variant/50'
                            }`}
                        >
                          {client.reference}
                        </span>
                      </td>

                      {/* Mood Tags */}
                      <td className={clsx('px-6', 'py-4')}>
                        <div className={clsx('flex', 'gap-1', 'flex-wrap')}>
                          {client.tags.map((tag) => (
                            <span
                              key={tag}
                              className={clsx('px-2', 'py-0.5', 'rounded-md', 'bg-secondary/5', 'text-secondary', 'font-ui-label-caps', 'text-[9px]', 'uppercase', 'border', 'border-secondary/10')}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Action */}
                      <td className={clsx('px-6', 'py-4', 'text-right')}>
                        <button
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-button-text text-xs transition-all active:scale-95 ${client.status !== 'offline'
                            ? 'bg-primary text-on-primary hover:bg-primary-container shadow-sm'
                            : 'border border-outline-variant text-primary hover:bg-surface-container-low'
                            }`}
                        >
                          <span className={clsx('material-symbols-outlined', 'text-[16px]')}>chat</span>
                          Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className={clsx('px-6', 'py-3', 'bg-surface-container-low', 'border-t', 'border-outline-variant/10', 'flex', 'justify-between', 'items-center')}>
              <span className={clsx('text-xs', 'text-on-surface-variant/60', 'font-ui-label-caps')}>
                Showing {CLIENTS.length} of {totalClients} active clients
              </span>
              <div className={clsx('flex', 'gap-2')}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`p-1 rounded hover:bg-surface-container-highest transition-colors text-on-surface-variant ${page === 1 ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                  disabled={page === 1}
                >
                  <span className={clsx('material-symbols-outlined', 'text-sm')}>chevron_left</span>
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className={clsx('p-1', 'rounded', 'hover:bg-surface-container-highest', 'transition-colors', 'text-on-surface-variant')}
                >
                  <span className={clsx('material-symbols-outlined', 'text-sm')}>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className={clsx('md:hidden', 'fixed', 'bottom-0', 'w-full', 'z-50', 'rounded-t-xl', 'bg-surface', 'border-t', 'border-outline-variant/30', 'shadow-[0_-10px_30px_rgba(6,78,59,0.05)]')}>
        <div className={clsx('flex', 'justify-around', 'items-center', 'h-16', 'w-full', 'px-4', 'pb-safe')}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`flex flex-col items-center justify-center transition-all duration-300 px-4 py-1 rounded-full ${item.active
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
              <span className={clsx('font-ui-label-caps', 'text-[10px]')}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Footer ── */}
      <footer className={clsx('w-full', 'py-stack-gap-md', 'mt-auto', 'bg-surface-container-low', 'border-t', 'border-outline-variant/10')}>
        <div className={clsx('flex', 'flex-col', 'items-center', 'gap-unit', 'px-container-padding', 'max-w-[1440px]', 'mx-auto', 'text-center')}>
          <span
            className={clsx('text-secondary', 'mb-2')}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}
          >
            JAWAB RASA
          </span>
          <div className={clsx('flex', 'gap-4', 'mb-4', 'flex-wrap', 'justify-center')}>
            {['Privacy', 'Terms', 'Support', 'Consultants'].map((link) => (
              <a
                key={link}
                href="#"
                className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'text-on-surface-variant', 'opacity-70', 'hover:text-primary', 'transition-opacity')}
              >
                {link}
              </a>
            ))}
          </div>
          <p className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'text-secondary', 'opacity-60')}>
            © 2024 JAWAB RASA. Seek your light.
          </p>
        </div>
      </footer>
    </div>
  )
}
