/**
 * AdminPage — JawabRasa Administrative Suite
 *
 * Sections:
 *   - Sidebar navigation (Consultant Approvals, User Mgmt, Audit Log, Templates, Monitoring)
 *   - Consultant Approvals: pending cards with Approve / Reject actions
 *   - User Management: searchable, paginated table with role badge & status toggle
 *   - Audit Log: scrollable timeline of admin actions
 *
 * Access control: protected by RequireAdmin guard in App.tsx
 * Data: fetched live from Supabase (public.users, public.consultants, public.admin_audit_logs)
 */

import clsx from 'clsx'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@jawabrasa/shared'
import { useAuthContext } from '../context/AuthContext'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Role = 'user' | 'admin' | 'superadmin'
type VerifStatus = 'pending' | 'approved' | 'rejected'
type NavSection = 'users' | 'consultants' | 'audit' | 'templates' | 'monitoring'

interface AppUser {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: Role
  is_active: boolean
  is_subscribed: boolean   // subscription status
  reflections_count: number
  created_at: string
}

interface Consultant {
  id: number
  full_name: string
  bio: string | null
  photo_url: string | null
  specialization: string | null
  verification_status: VerifStatus
  is_paid_service: boolean
  price_per_session: number
  is_active: boolean
  created_at: string
}

interface AuditLog {
  id: number
  admin_id: string
  action: string
  target_table: string | null
  target_id: number | null
  details: Record<string, unknown> | null
  created_at: string
  users?: { full_name: string; email: string }
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const AVATAR_COLORS = [
  'bg-primary-fixed text-on-primary-fixed',
  'bg-secondary-fixed text-on-secondary-fixed',
  'bg-primary-fixed-dim text-on-primary-fixed-variant',
  'bg-surface-dim text-on-surface-variant',
]
function avatarColor(id: string) {
  const n = id.charCodeAt(0) + (id.charCodeAt(1) ?? 0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

const ROLE_STYLES: Record<Role, string> = {
  user: 'bg-surface-container-high text-on-surface-variant',
  admin: 'bg-primary-fixed text-on-primary-fixed-variant',
  superadmin: 'bg-secondary-container text-on-secondary-container',
}

const VERIF_STYLES: Record<VerifStatus, string> = {
  pending: 'bg-[#e0d83d] text-[#004d40] font-bold',
  approved: 'bg-primary-fixed text-on-primary-fixed-variant',
  rejected: 'bg-error-container text-on-error-container',
}

/* ─────────────────────────────────────────────
   Dummy data — shown when Supabase has no rows yet
───────────────────────────────────────────── */
const DUMMY_USERS: AppUser[] = [
  { id: 'u1', full_name: 'Sarah Ahmed', email: 'sarah.a@example.com', avatar_url: null, role: 'user', is_active: true, is_subscribed: true, reflections_count: 14, created_at: '2023-10-12T00:00:00Z' },
  { id: 'u2', full_name: 'Yusuf Khan', email: 'y.khan88@testmail.io', avatar_url: null, role: 'user', is_active: true, is_subscribed: true, reflections_count: 28, created_at: '2023-11-02T00:00:00Z' },
  { id: 'u3', full_name: 'Elena Miras', email: 'elena.m@domain.com', avatar_url: null, role: 'user', is_active: false, is_subscribed: false, reflections_count: 0, created_at: '2023-12-20T00:00:00Z' },
  { id: 'u4', full_name: 'Ibrahim Bakir', email: 'ibrahim@legacy.net', avatar_url: null, role: 'admin', is_active: true, is_subscribed: true, reflections_count: 42, created_at: '2024-01-05T00:00:00Z' },
  { id: 'u5', full_name: 'Layla Hassan', email: 'layla.h@mail.io', avatar_url: null, role: 'user', is_active: true, is_subscribed: false, reflections_count: 7, created_at: '2024-02-18T00:00:00Z' },
  { id: 'u6', full_name: 'Omar Farouq', email: 'omar.f@quranic.org', avatar_url: null, role: 'user', is_active: true, is_subscribed: true, reflections_count: 63, created_at: '2024-03-01T00:00:00Z' },
  { id: 'u7', full_name: 'Nour Al-Din', email: 'nour.d@islamic.id', avatar_url: null, role: 'user', is_active: true, is_subscribed: false, reflections_count: 3, created_at: '2024-03-22T00:00:00Z' },
  { id: 'u8', full_name: 'Amina Zahra', email: 'amina.z@masjid.my', avatar_url: null, role: 'superadmin', is_active: true, is_subscribed: true, reflections_count: 91, created_at: '2024-04-10T00:00:00Z' },
]

const DUMMY_CONSULTANTS: Consultant[] = [
  { id: 1, full_name: 'Dr. Omar Al-Farsi', bio: 'Seeking to provide deeper context on Andalusian poetic structures in the Quranic narrative.', photo_url: null, specialization: 'Islamic Philosophy', verification_status: 'pending', is_paid_service: false, price_per_session: 0, is_active: true, created_at: '2024-06-01T00:00:00Z' },
  { id: 2, full_name: 'Fatima Zahra', bio: 'Specializing in the comparative analysis of Meccan surahs and their phonetic harmony.', photo_url: null, specialization: 'Linguistic Analysis', verification_status: 'pending', is_paid_service: true, price_per_session: 150000, is_active: true, created_at: '2024-06-03T00:00:00Z' },
  { id: 3, full_name: 'Prof. Hassan Rahim', bio: '15 years of academic research in the sociopolitical environment of early revelation periods.', photo_url: null, specialization: 'Historical Context', verification_status: 'pending', is_paid_service: true, price_per_session: 200000, is_active: true, created_at: '2024-06-05T00:00:00Z' },
  { id: 4, full_name: 'Dr. Aisha Malik', bio: 'Focusing on the healing dimension of Quranic recitation and its effect on mental wellness.', photo_url: null, specialization: 'Spiritual Wellness', verification_status: 'approved', is_paid_service: true, price_per_session: 175000, is_active: true, created_at: '2024-05-10T00:00:00Z' },
  { id: 5, full_name: 'Ustaz Bilal Idris', bio: 'Expert in Tajweed rules and Quranic memorization techniques for children and adults.', photo_url: null, specialization: 'Tajweed & Memorization', verification_status: 'rejected', is_paid_service: false, price_per_session: 0, is_active: false, created_at: '2024-05-15T00:00:00Z' },
]

/* ─────────────────────────────────────────────
   Toast hook
───────────────────────────────────────────── */
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  return { toast, show }
}

/* ─────────────────────────────────────────────
   ConsultantCard sub-component
───────────────────────────────────────────── */
function ConsultantCard({
  c,
  onApprove,
  onReject,
}: {
  c: Consultant
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={clsx('bg-surface', 'relative', 'rounded-xl', 'shadow-[0_10px_30px_rgba(6,78,59,0.05)]', 'p-6', 'flex', 'flex-col', 'gap-4', 'border', 'border-outline-variant/10', 'transition-all', 'duration-300', 'hover:shadow-[0_16px_40px_rgba(6,78,59,0.1)]')}>
      <div className={clsx('flex', 'items-start', 'gap-4')}>
        {c.photo_url ? (
          <img src={c.photo_url} alt={c.full_name} className={clsx('w-14', 'h-14', 'rounded-full', 'object-cover', 'shadow-sm', 'ring-2', 'ring-primary/10')} />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${avatarColor(String(c.id))}`}>
            {initials(c.full_name)}
          </div>
        )}
        <div className={clsx('flex-1', 'min-w-0')}>
          <h4 className={clsx('font-bold', 'text-primary', 'truncate')}>{c.full_name}</h4>
          <p className={clsx('text-xs', 'text-on-surface-variant', 'font-ui-label-caps', 'uppercase', 'tracking-wider')}>
            {c.specialization ?? 'General'}
          </p>
          <span className={`inline-block mt-1 text-[10px] font-ui-label-caps px-2 py-0.5 rounded-full ${VERIF_STYLES[c.verification_status]}`}>
            {c.verification_status}
          </span>
        </div>
        {c.is_paid_service && (
          <span className={clsx('text-[10px]', 'font-ui-label-caps', 'bg-secondary-container', 'text-on-secondary-container', 'px-2', 'py-0.5', 'rounded-full', 'whitespace-nowrap')}>
            Rp {c.price_per_session.toLocaleString('id-ID')}
          </span>
        )}
      </div>

      {c.bio && (
        <div>
          <p className={`text-sm text-on-surface-variant italic ${expanded ? '' : 'line-clamp-2 overflow-hidden'}`}>
            &ldquo;{c.bio}&rdquo;
          </p>
          {c.bio.length > 80 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className={clsx('text-[10px]', 'text-primary', 'mt-1', 'font-ui-label-caps', 'hover:underline')}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      <p className={clsx('text-[10px]', 'text-on-surface-variant/50', 'font-ui-label-caps')}>
        Submitted {fmtDate(c.created_at)}
      </p>

      {c.verification_status === 'pending' && (
        <div className={clsx('mt-auto', 'flex', 'gap-2')}>
          <button
            onClick={() => onApprove(c.id)}
            className={clsx('flex-1', 'py-2', 'bg-primary', 'text-on-primary', 'rounded-lg', 'font-button-text', 'text-xs', 'hover:opacity-90', 'active:scale-95', 'transition-all', 'flex', 'items-center', 'justify-center', 'gap-1')}
          >
            <span className={clsx('material-symbols-outlined', 'text-sm')}>check_circle</span>
            Approve
          </button>
          <button
            onClick={() => onReject(c.id)}
            className={clsx('flex-1', 'py-2', 'border', 'border-error', 'text-error', 'rounded-lg', 'font-button-text', 'text-xs', 'hover:bg-error-container', 'transition-all', 'flex', 'items-center', 'justify-center', 'gap-1')}
          >
            <span className={clsx('material-symbols-outlined', 'text-sm')}>cancel</span>
            Reject
          </button>
        </div>
      )}

      {c.verification_status !== 'pending' && (
        <div className={`rounded-lg px-4 py-2.5 text-center text-xs font-ui-label-caps ${VERIF_STYLES[c.verification_status]}`}>
          {c.verification_status === 'approved' ? '✓ Approved & visible to users' : '✗ Rejected'}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Skeleton row (6 cols now)
───────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className={clsx('px-6', 'py-5')}>
          <div className={clsx('h-4', 'rounded-full', 'bg-surface-container-highest', 'animate-pulse', 'w-3/4')} />
        </td>
      ))}
    </tr>
  )
}

/* ─────────────────────────────────────────────
   AdminPage (main export)
───────────────────────────────────────────── */
export default function AdminPage() {
  useEffect(() => { console.log('[Page] AdminPage mounted') }, [])
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()
  const { toast, show: showToast } = useToast()

  const [activeSection, setActiveSection] = useState<NavSection>('consultants')

  /* ── Users ── */
  const [users, setUsers] = useState<AppUser[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersSearch, setUsersSearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  /* ── Consultants ── */
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [consultantFilter, setConsultantFilter] = useState<VerifStatus | 'all'>('pending')
  const [consultantsLoading, setConsultantsLoading] = useState(false)

  /* ── Audit ── */
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  const PAGE_SIZE = 8

  /* ── Fetch helpers ── */
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    const from = (usersPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let q = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (usersSearch.trim()) {
      q = q.or(`full_name.ilike.%${usersSearch}%,email.ilike.%${usersSearch}%`)
    }

    const { data, count, error } = await q
    if (!error) {
      const rows = (data as AppUser[]) ?? []
      // Fallback to dummy data when DB has no rows
      if (rows.length === 0 && usersPage === 1 && !usersSearch.trim()) {
        setUsers(DUMMY_USERS)
        setUsersTotal(DUMMY_USERS.length)
      } else {
        setUsers(rows)
        setUsersTotal(count ?? 0)
      }
    }
    setUsersLoading(false)
  }, [usersPage, usersSearch])

  const fetchConsultants = useCallback(async () => {
    setConsultantsLoading(true)
    let q = supabase.from('consultants').select('*').order('created_at', { ascending: false })
    if (consultantFilter !== 'all') q = q.eq('verification_status', consultantFilter)
    const { data, error } = await q
    if (!error) {
      const rows = (data as Consultant[]) ?? []
      // Fallback to dummy data when DB has no rows
      const filtered = consultantFilter === 'all'
        ? DUMMY_CONSULTANTS
        : DUMMY_CONSULTANTS.filter(c => c.verification_status === consultantFilter)
      setConsultants(rows.length === 0 ? filtered : rows)
    }
    setConsultantsLoading(false)
  }, [consultantFilter])

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) setLogs((data as AuditLog[]) ?? [])
    setLogsLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchConsultants() }, [fetchConsultants])
  useEffect(() => {
    if (activeSection === 'audit') fetchLogs()
  }, [activeSection, fetchLogs])

  /* Search debounce → reset page */
  useEffect(() => {
    const t = setTimeout(() => setUsersPage(1), 350)
    return () => clearTimeout(t)
  }, [usersSearch])

  /* ── Write audit entry ── */
  const writeAudit = useCallback(async (
    action: string,
    targetTable: string,
    targetId: number,
    details?: Record<string, unknown>,
  ) => {
    if (!user) return
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action,
      target_table: targetTable,
      target_id: targetId,
      details: details ?? null,
    })
  }, [user])

  /* ── Actions ── */
  const updateConsultantStatus = useCallback(async (id: number, status: VerifStatus) => {
    const { error } = await supabase.from('consultants').update({ verification_status: status }).eq('id', id)
    if (error) {
      showToast('Failed: ' + error.message, 'error')
    } else {
      await writeAudit(
        status === 'approved' ? 'approve_consultant' : 'reject_consultant',
        'consultants', id, { new_status: status },
      )
      showToast(`Consultant ${status === 'approved' ? 'approved' : 'rejected'}.`)
      fetchConsultants()
    }
  }, [showToast, writeAudit, fetchConsultants])

  const toggleUserActive = useCallback(async (u: AppUser) => {
    const { error } = await supabase.from('users').update({ is_active: !u.is_active }).eq('id', u.id)
    if (error) {
      showToast('Failed: ' + error.message, 'error')
    } else {
      await writeAudit(
        u.is_active ? 'deactivate_user' : 'activate_user',
        'users', 0, { user_id: u.id, new_status: !u.is_active },
      )
      showToast(`User ${u.is_active ? 'deactivated' : 'activated'}.`)
      fetchUsers()
    }
  }, [showToast, writeAudit, fetchUsers])

  const updateUserRole = useCallback(async (u: AppUser, role: Role) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', u.id)
    if (error) {
      showToast('Failed: ' + error.message, 'error')
    } else {
      await writeAudit('change_user_role', 'users', 0, { user_id: u.id, old_role: u.role, new_role: role })
      showToast(`Role updated to "${role}".`)
      fetchUsers()
    }
  }, [showToast, writeAudit, fetchUsers])

  const pendingCount = consultants.filter((c) => c.verification_status === 'pending').length

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div className={clsx('min-h-screen', 'bg-background', 'text-on-surface', 'font-ui-body')}>

      {/* ══ Sidebar ══ */}
      <aside className={clsx('h-screen', 'w-64', 'fixed', 'left-0', 'top-0', 'bg-surface', 'shadow-[0_10px_30px_rgba(6,78,59,0.05)]', 'flex', 'flex-col', 'p-6', 'gap-6', 'border-r', 'border-outline-variant/30', 'z-50')}>
        <div className="mb-2">
          <h1
            className={clsx('font-verse-display', 'text-verse-display', 'text-primary', 'tracking-tight', 'cursor-pointer', 'hover:opacity-80', 'transition-opacity')}
            onClick={() => navigate('/dashboard')}
          >
            JawabRasa
          </h1>
          <p className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'text-on-surface-variant', 'opacity-70', 'mt-0.5')}>
            Administrative Suite
          </p>
        </div>

        <nav className={clsx('flex-1', 'flex', 'flex-col', 'gap-1.5')}>
          {(
            [
              { key: 'consultants', label: 'Consultant Approvals', icon: 'how_to_reg', badge: pendingCount },
              { key: 'users', label: 'User Management', icon: 'group', badge: 0 },
              { key: 'audit', label: 'Audit Log', icon: 'history', badge: 0 },
              { key: 'templates', label: 'Image Templates', icon: 'palette', badge: 0 },
              { key: 'monitoring', label: 'Consultations', icon: 'chat_bubble', badge: 0 },
            ] as { key: NavSection; label: string; icon: string; badge: number }[]
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeSection === item.key
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
              style={activeSection === item.key ? { backgroundColor: '#e0d83d' } : undefined}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: activeSection === item.key ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'flex-1')}>{item.label}</span>
              {item.badge > 0 && (
                <span className={clsx('bg-secondary', 'text-on-primary', 'text-[10px]', 'font-bold', 'px-1.5', 'py-0.5', 'rounded-full', 'leading-none')}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={clsx('flex', 'flex-col', 'gap-1', 'pt-4', 'border-t', 'border-outline-variant/20')}>
          <button
            onClick={() => navigate('/dashboard')}
            className={clsx('flex', 'items-center', 'gap-3', 'px-4', 'py-2', 'text-on-surface-variant', 'hover:text-primary', 'transition-colors', 'rounded-lg', 'w-full')}
          >
            <span className={clsx('material-symbols-outlined', 'text-sm')}>arrow_back</span>
            <span className={clsx('font-ui-label-caps', 'text-ui-label-caps')}>Back to App</span>
          </button>
          <button
            onClick={async () => { await signOut(); navigate('/login') }}
            className={clsx('flex', 'items-center', 'gap-3', 'px-4', 'py-2', 'text-on-surface-variant', 'hover:text-error', 'transition-colors', 'rounded-lg', 'w-full')}
          >
            <span className={clsx('material-symbols-outlined', 'text-sm')}>logout</span>
            <span className={clsx('font-ui-label-caps', 'text-ui-label-caps')}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ══ Top Bar ══ */}
      <header className={clsx('fixed', 'top-0', 'right-0', 'w-[calc(100%-16rem)]', 'h-16', 'bg-surface/80', 'backdrop-blur-md', 'border-b', 'border-outline-variant/20', 'z-40')}>
        <div className={clsx('flex', 'justify-between', 'items-center', 'px-8', 'w-full', 'h-full')}>
          <h2 className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'text-primary', 'font-bold', 'uppercase', 'tracking-widest')}>
            {activeSection === 'consultants' && 'Consultant Approvals'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'audit' && 'Audit Log'}
            {activeSection === 'templates' && 'Image Templates'}
            {activeSection === 'monitoring' && 'Consultation Monitoring'}
          </h2>

          <div className={clsx('flex', 'items-center', 'gap-4')}>
            {activeSection === 'users' && (
              <div className="relative">
                <input
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className={clsx('bg-surface-container-low', 'border-none', 'rounded-full', 'px-10', 'py-2', 'text-sm', 'w-60', 'focus:ring-1', 'focus:ring-primary/20', 'placeholder:text-on-surface-variant/50', 'outline-none')}
                  placeholder="Search users…"
                />
                <span className={clsx('material-symbols-outlined', 'absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'text-on-surface-variant', 'text-xl')}>
                  search
                </span>
              </div>
            )}

            {activeSection === 'consultants' && (
              <div className={clsx('flex', 'gap-1', 'bg-surface-container-low', 'p-1', 'rounded-full')}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setConsultantFilter(f)}
                    className={`px-3 py-1 rounded-full font-ui-label-caps text-ui-label-caps capitalize transition-all ${consultantFilter === f
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {/* Admin avatar */}
            <div className={clsx('flex', 'items-center', 'gap-2', 'pl-4', 'border-l', 'border-outline-variant/30')}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor(user?.id ?? 'admin')}`}>
                {initials(user?.user_metadata?.full_name ?? user?.email ?? 'Admin')}
              </div>
              <div className={clsx('hidden', 'sm:block')}>
                <p className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'text-on-surface', 'leading-none')}>
                  {user?.user_metadata?.full_name ?? 'Admin'}
                </p>
                <p className={clsx('text-[10px]', 'text-on-surface-variant')}>Superadmin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ Main Canvas ══ */}
      <main className={clsx('ml-64', 'pt-16', 'min-h-screen')}>
        <div className={clsx('p-8', 'max-w-[1200px]', 'mx-auto', 'space-y-12')}>

          {/* ════ CONSULTANT APPROVALS ════ */}
          {activeSection === 'consultants' && (
            <section className="reveal-animation">
              <div className={clsx('flex', 'items-start', 'justify-between', 'gap-4', 'mb-6')}>
                <div className={clsx('min-w-0')}>
                  <h3 className={clsx('font-verse-display', 'text-verse-display', 'text-primary')}>Consultant Approvals</h3>
                  <p className={clsx('font-ui-body', 'text-ui-body', 'text-on-surface-variant', 'mt-1')}>
                    Review verification requests for expert profiles.
                  </p>
                </div>
                {pendingCount > 0 && (
                  <span className={clsx('bg-secondary-container', 'px-4', 'py-1', 'rounded-full', 'font-ui-label-caps', 'text-ui-label-caps', 'text-on-secondary-container', 'whitespace-nowrap', 'shrink-0')}>
                    {pendingCount} Pending
                  </span>
                )}
              </div>

              {consultantsLoading ? (
                <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={clsx('rounded-xl', 'border', 'border-outline-variant/10', 'p-6', 'space-y-3', 'animate-pulse')}>
                      <div className={clsx('flex', 'gap-4')}>
                        <div className={clsx('w-14', 'h-14', 'rounded-full', 'bg-surface-container-highest')} />
                        <div className={clsx('flex-1', 'space-y-2', 'pt-1')}>
                          <div className={clsx('h-4', 'bg-surface-container-highest', 'rounded-full', 'w-3/4')} />
                          <div className={clsx('h-3', 'bg-surface-container-highest', 'rounded-full', 'w-1/2')} />
                        </div>
                      </div>
                      <div className={clsx('h-12', 'bg-surface-container-highest', 'rounded-lg')} />
                      <div className={clsx('flex', 'gap-2')}>
                        <div className={clsx('flex-1', 'h-8', 'bg-surface-container-highest', 'rounded-lg')} />
                        <div className={clsx('flex-1', 'h-8', 'bg-surface-container-highest', 'rounded-lg')} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : consultants.length === 0 ? (
                <div className={clsx('text-center', 'py-20', 'text-on-surface-variant')}>
                  <span className={clsx('material-symbols-outlined', 'text-5xl', 'mb-3', 'block', 'opacity-20')}>how_to_reg</span>
                  <p className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'opacity-50')}>
                    No {consultantFilter !== 'all' ? consultantFilter : ''} consultants found.
                  </p>
                </div>
              ) : (
                <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')}>
                  {consultants.map((c) => (
                    <ConsultantCard
                      key={c.id}
                      c={c}
                      onApprove={(id) => updateConsultantStatus(id, 'approved')}
                      onReject={(id) => updateConsultantStatus(id, 'rejected')}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ════ USER MANAGEMENT ════ */}
          {activeSection === 'users' && (
            <section className="reveal-animation">
              <div className="mb-6">
                <h3 className={clsx('font-verse-display', 'text-verse-display', 'text-primary')}>User Management</h3>
                <p className={clsx('font-ui-body', 'text-ui-body', 'text-on-surface-variant', 'mt-1')}>
                  Manage platform accounts, roles, and access status.
                </p>
              </div>

              <div className={clsx('bg-white', 'rounded-2xl', 'shadow-[0_10px_30px_rgba(6,78,59,0.05)]', 'border', 'border-outline-variant/20', 'overflow-hidden')}>
                {/* Table header bar */}
                <div className={clsx('px-8', 'py-5', 'border-b', 'border-outline-variant/10', 'flex', 'justify-between', 'items-center', 'bg-surface-container-low/30')}>
                  <h4 className={clsx('font-bold', 'text-primary', 'flex', 'items-center', 'gap-2')}>
                    <span className="material-symbols-outlined">group</span>
                    Platform Users
                    {usersTotal > 0 && (
                      <span className={clsx('ml-1', 'text-xs', 'font-normal', 'text-on-surface-variant')}>
                        ({usersTotal.toLocaleString()} total)
                      </span>
                    )}
                  </h4>
                  <div className={clsx('flex', 'gap-2')}>
                    <button className={clsx('px-4', 'py-1.5', 'rounded-full', 'border', 'border-outline-variant', 'text-xs', 'font-ui-label-caps', 'text-on-surface-variant', 'hover:bg-surface', 'transition-colors', 'flex', 'items-center', 'gap-1.5')}>
                      <span className={clsx('material-symbols-outlined', 'text-sm')}>filter_list</span> Filter
                    </button>
                    <button className={clsx('px-4', 'py-1.5', 'rounded-full', 'border', 'border-outline-variant', 'text-xs', 'font-ui-label-caps', 'text-on-surface-variant', 'hover:bg-surface', 'transition-colors', 'flex', 'items-center', 'gap-1.5')}>
                      <span className={clsx('material-symbols-outlined', 'text-sm')}>download</span> Export
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className={clsx('w-full', 'text-left')}>
                    <thead className={clsx('bg-surface-container-low/50', 'border-b', 'border-outline-variant/10')}>
                      <tr>
                        {(['User Identity', 'Role', 'Subscription', 'Reflections', 'Status', 'Join Date', 'Actions'] as const).map((h) => (
                          <th
                            key={h}
                            className={`py-4 font-ui-label-caps text-ui-label-caps text-on-surface-variant opacity-60 ${h === 'User Identity' ? 'pl-8 pr-6' : 'px-6'
                              } ${h === 'Actions' ? 'text-right pr-8' : ''}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={clsx('divide-y', 'divide-outline-variant/10')}>
                      {usersLoading
                        ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                        : users.length === 0
                          ? (
                            <tr>
                              <td colSpan={5} className={clsx('px-8', 'py-16', 'text-center', 'text-on-surface-variant')}>
                                <span className={clsx('material-symbols-outlined', 'text-3xl', 'block', 'mb-2', 'opacity-20')}>group</span>
                                <span className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'opacity-40')}>No users found.</span>
                              </td>
                            </tr>
                          )
                          : users.map((u) => (
                            <tr
                              key={u.id}
                              className={`hover:bg-surface-container-low/20 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}
                            >
                              {/* Identity */}
                              <td className={clsx('pl-8', 'pr-6', 'py-5')}>
                                <div className={clsx('flex', 'items-center', 'gap-3')}>
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt={u.full_name} className={clsx('w-10', 'h-10', 'rounded-full', 'object-cover')} />
                                  ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${avatarColor(u.id)}`}>
                                      {initials(u.full_name)}
                                    </div>
                                  )}
                                  <div>
                                    <p className={clsx('font-bold', 'text-on-surface', 'text-sm')}>{u.full_name}</p>
                                    <p className={clsx('text-xs', 'text-on-surface-variant')}>{u.email}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Role selector */}
                              <td className={clsx('px-6', 'py-5')}>
                                <select
                                  value={u.role}
                                  onChange={(e) => updateUserRole(u, e.target.value as Role)}
                                  className={`text-xs font-ui-label-caps px-2 py-1 rounded-full border-none outline-none cursor-pointer appearance-none ${ROLE_STYLES[u.role]}`}
                                >
                                  <option value="user">user</option>
                                  <option value="admin">admin</option>
                                  <option value="superadmin">superadmin</option>
                                </select>
                              </td>

                              {/* Subscription badge */}
                              <td className={clsx('px-6', 'py-5')}>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${u.is_subscribed
                                      ? 'bg-secondary-container text-on-secondary-container'
                                      : 'bg-surface-container-high text-on-surface-variant'
                                    }`}
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: 12, fontVariationSettings: u.is_subscribed ? "'FILL' 1" : "'FILL' 0" }}
                                  >
                                    {u.is_subscribed ? 'workspace_premium' : 'person'}
                                  </span>
                                  {u.is_subscribed ? 'Pro' : 'Free'}
                                </span>
                              </td>

                              {/* Reflections count */}
                              <td className={clsx('px-6', 'py-5')}>
                                <span className={clsx('px-2.5', 'py-0.5', 'rounded-full', 'bg-surface-container-highest', 'text-primary', 'text-xs', 'font-bold')}>
                                  {u.reflections_count ?? 0}
                                </span>
                              </td>

                              {/* Active toggle */}
                              <td className={clsx('px-6', 'py-5')}>
                                <label className={clsx('relative', 'inline-flex', 'items-center', 'cursor-pointer', 'gap-2')}>
                                  <input
                                    type="checkbox"
                                    checked={u.is_active}
                                    onChange={() => toggleUserActive(u)}
                                    className={clsx('sr-only', 'peer')}
                                  />
                                  <div className={clsx('w-9', 'h-5', 'bg-outline-variant', 'peer-focus:outline-none', 'rounded-full', 'peer', 'relative', 'peer-checked:after:translate-x-full', 'peer-checked:after:border-white', "after:content-['']", 'after:absolute', 'after:top-[2px]', 'after:left-[2px]', 'after:bg-white', 'after:border-gray-300', 'after:border', 'after:rounded-full', 'after:h-4', 'after:w-4', 'after:transition-all', 'peer-checked:bg-primary')} />
                                  <span className={clsx('text-xs', 'font-medium', 'text-on-surface-variant')}>
                                    {u.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </label>
                              </td>

                              {/* Join date */}
                              <td className={clsx('px-6', 'py-5', 'text-sm', 'text-on-surface-variant')}>
                                {fmtDate(u.created_at)}
                              </td>

                              {/* Subscription toggle */}
                              <td className={clsx('px-6', 'pr-8', 'py-5', 'text-right')}>
                                <button
                                  onClick={async () => {
                                    const next = !u.is_subscribed
                                    const { error } = await supabase
                                      .from('users')
                                      .update({ is_subscribed: next })
                                      .eq('id', u.id)
                                    if (error) {
                                      showToast('Failed to update subscription', 'error')
                                    } else {
                                      showToast(`User ${next ? 'upgraded to' : 'removed from'} Pro`)
                                      fetchUsers()
                                    }
                                  }}
                                  className={clsx(
                                    'text-[11px]', 'font-bold', 'px-3', 'py-1.5', 'rounded-lg',
                                    'transition-all', 'border',
                                    u.is_subscribed
                                      ? 'bg-secondary-container text-on-secondary-container border-secondary-container hover:bg-secondary-container/70'
                                      : 'bg-surface-container-high text-primary border-primary/20 hover:bg-primary/10',
                                  )}
                                >
                                  {u.is_subscribed ? 'Remove Pro' : 'Mark Pro'}
                                </button>
                              </td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className={clsx('px-8', 'py-4', 'border-t', 'border-outline-variant/10', 'flex', 'justify-between', 'items-center', 'bg-surface-container-low/30')}>
                  <p className={clsx('text-xs', 'text-on-surface-variant')}>
                    Showing {usersTotal === 0 ? 0 : Math.min((usersPage - 1) * PAGE_SIZE + 1, usersTotal)}–
                    {Math.min(usersPage * PAGE_SIZE, usersTotal)} of {usersTotal.toLocaleString()} users
                  </p>
                  <div className={clsx('flex', 'items-center', 'gap-2')}>
                    <button
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className={clsx('p-1.5', 'rounded-lg', 'border', 'border-outline-variant', 'hover:bg-surface', 'disabled:opacity-30', 'disabled:cursor-not-allowed', 'transition-colors')}
                    >
                      <span className={clsx('material-symbols-outlined', 'text-sm')}>chevron_left</span>
                    </button>
                    <span className={clsx('px-2', 'text-xs', 'text-on-surface-variant', 'font-ui-label-caps')}>
                      {usersPage} / {Math.ceil(usersTotal / PAGE_SIZE) || 1}
                    </span>
                    <button
                      onClick={() => setUsersPage((p) => p + 1)}
                      disabled={usersPage * PAGE_SIZE >= usersTotal}
                      className={clsx('p-1.5', 'rounded-lg', 'border', 'border-outline-variant', 'hover:bg-surface', 'disabled:opacity-30', 'disabled:cursor-not-allowed', 'transition-colors')}
                    >
                      <span className={clsx('material-symbols-outlined', 'text-sm')}>chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ════ AUDIT LOG ════ */}
          {activeSection === 'audit' && (
            <section className="reveal-animation">
              <div className="mb-6">
                <h3 className={clsx('font-verse-display', 'text-verse-display', 'text-primary')}>Audit Log</h3>
                <p className={clsx('font-ui-body', 'text-ui-body', 'text-on-surface-variant', 'mt-1')}>
                  A chronological record of all administrative actions.
                </p>
              </div>

              <div className={clsx('bg-white', 'rounded-2xl', 'shadow-[0_10px_30px_rgba(6,78,59,0.05)]', 'border', 'border-outline-variant/20', 'overflow-hidden')}>
                {logsLoading ? (
                  <div className={clsx('p-8', 'space-y-4')}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={clsx('flex', 'gap-4', 'animate-pulse')}>
                        <div className={clsx('w-8', 'h-8', 'rounded-full', 'bg-surface-container-highest', 'flex-shrink-0')} />
                        <div className={clsx('flex-1', 'space-y-2', 'pt-1')}>
                          <div className={clsx('h-4', 'bg-surface-container-highest', 'rounded-full', 'w-1/2')} />
                          <div className={clsx('h-3', 'bg-surface-container-highest', 'rounded-full', 'w-1/3')} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : logs.length === 0 ? (
                  <div className={clsx('py-20', 'text-center', 'text-on-surface-variant')}>
                    <span className={clsx('material-symbols-outlined', 'text-5xl', 'block', 'mb-2', 'opacity-20')}>history</span>
                    <span className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'opacity-40')}>No audit entries yet.</span>
                  </div>
                ) : (
                  <div className={clsx('divide-y', 'divide-outline-variant/10')}>
                    {logs.map((log) => (
                      <div key={log.id} className={clsx('flex', 'items-start', 'gap-4', 'px-8', 'py-5', 'hover:bg-surface-container-low/20', 'transition-colors')}>
                        <div className={clsx('w-8', 'h-8', 'rounded-full', 'bg-primary-fixed', 'flex', 'items-center', 'justify-center', 'flex-shrink-0', 'mt-0.5')}>
                          <span className={clsx('material-symbols-outlined', 'text-sm', 'text-on-primary-fixed-variant')}>
                            {log.action.includes('approve') ? 'check_circle'
                              : log.action.includes('reject') ? 'cancel'
                                : log.action.includes('activate') ? 'toggle_on'
                                  : log.action.includes('role') ? 'manage_accounts'
                                    : 'edit'}
                          </span>
                        </div>
                        <div className={clsx('flex-1', 'min-w-0')}>
                          <div className={clsx('flex', 'items-baseline', 'gap-2', 'flex-wrap')}>
                            <span className={clsx('font-bold', 'text-sm', 'text-on-surface')}>
                              {log.users?.full_name ?? log.admin_id.slice(0, 8) + '…'}
                            </span>
                            <span className={clsx('text-sm', 'text-on-surface-variant')}>
                              performed{' '}
                              <code className={clsx('bg-surface-container-highest', 'text-primary', 'text-xs', 'px-1.5', 'py-0.5', 'rounded')}>
                                {log.action}
                              </code>
                            </span>
                          </div>
                          {log.target_table && (
                            <p className={clsx('text-xs', 'text-on-surface-variant', 'mt-0.5')}>
                              on <span className="font-medium">{log.target_table}</span>
                              {log.target_id ? ` #${log.target_id}` : ''}
                            </p>
                          )}
                          {log.details && (
                            <p className={clsx('text-xs', 'text-on-surface-variant/60', 'mt-1', 'font-mono', 'truncate')}>
                              {JSON.stringify(log.details)}
                            </p>
                          )}
                        </div>
                        <span className={clsx('text-xs', 'text-on-surface-variant/50', 'flex-shrink-0', 'font-ui-label-caps')}>
                          {fmtDate(log.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ════ PLACEHOLDER SECTIONS ════ */}
          {(activeSection === 'templates' || activeSection === 'monitoring') && (
            <section className="reveal-animation">
              <div className="mb-6">
                <h3 className={clsx('font-verse-display', 'text-verse-display', 'text-primary')}>
                  {activeSection === 'templates' ? 'Image Templates' : 'Consultation Monitoring'}
                </h3>
                <p className={clsx('font-ui-body', 'text-ui-body', 'text-on-surface-variant', 'mt-1')}>
                  {activeSection === 'templates'
                    ? 'Manage quote image template designs available to users.'
                    : 'Monitor active and past consultation sessions.'}
                </p>
              </div>
              <div className={clsx('bg-white', 'rounded-2xl', 'border', 'border-outline-variant/20', 'flex', 'flex-col', 'items-center', 'justify-center', 'py-36', 'gap-3')}>
                <span className={clsx('material-symbols-outlined', 'text-5xl', 'text-on-surface-variant', 'opacity-20')}>
                  {activeSection === 'templates' ? 'palette' : 'chat_bubble'}
                </span>
                <p className={clsx('font-ui-label-caps', 'text-ui-label-caps', 'text-on-surface-variant', 'opacity-40')}>
                  Coming soon — feature in development
                </p>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* ══ Toast ══ */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[100] pointer-events-none transition-all duration-500 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          } ${toast?.type === 'error' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'}`}
      >
        <span className="material-symbols-outlined">
          {toast?.type === 'error' ? 'error' : 'check_circle'}
        </span>
        <span className={clsx('font-ui-label-caps', 'text-ui-label-caps')}>{toast?.msg ?? ''}</span>
      </div>

      {/* ══ Local CSS ══ */}
      <style>{`
        .reveal-animation {
          animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vellum-texture {
          background-image: radial-gradient(#064e3b05 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .gold-border { border-top: 2px solid #fed65b; }
      `}</style>
    </div>
  )
}
