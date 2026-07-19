/**
 * ProfileDropdown — shared component untuk top bar di semua halaman.
 *
 * Menampilkan ikon account_circle. Klik → dropdown muncul:
 *   - User biasa   : Profile, Logout
 *   - Admin/Superadmin: Profile, Admin Dashboard, Logout
 *
 * Role dibaca langsung dari public.users agar tidak bisa dimanipulasi
 * lewat auth metadata.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

type Role = 'user' | 'admin' | 'superadmin'

export default function ProfileDropdown() {
  const navigate  = useNavigate()
  const { user, signOut } = useAuthContext()

  const [open, setOpen]   = useState(false)
  const [role, setRole]   = useState<Role>('user')
  const dropdownRef       = useRef<HTMLDivElement>(null)

  /* ── Check admin status via SECURITY DEFINER RPC (bypasses RLS) ── */
  useEffect(() => {
    if (!user) return

    // Primary: use the is_admin() SECURITY DEFINER function — bypasses RLS entirely
    supabase
      .rpc('is_admin')
      .then(({ data: isAdminResult, error: rpcError }) => {
        if (rpcError) {
          console.error('[ProfileDropdown] is_admin() RPC error:', rpcError)
          // Fallback: try direct query
          return supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
            .then(({ data, error: queryError }) => {
              if (queryError) {
                console.error('[ProfileDropdown] role query error:', queryError)
                return
              }
              if (data?.role) setRole(data.role as Role)
            })
        }

        // Set role based on RPC result + fetch actual role for display
        if (isAdminResult) {
          // Is admin, fetch exact role (admin vs superadmin) for badge display
          supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
              if (data?.role) setRole(data.role as Role)
              else setRole('admin') // safe default if query fails
            })
        } else {
          setRole('user')
        }
      })
  }, [user])

  /* ── Close on outside click ── */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const handleLogout = useCallback(async () => {
    setOpen(false)
    await signOut()
    navigate('/login')
  }, [signOut, navigate])

  const isAdmin = role === 'admin' || role === 'superadmin'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        id="profile-dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        title="Account"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
        >
          account_circle
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-[999]"
          style={{
            background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 8px 32px rgba(6,78,59,0.14)',
            border: '1px solid rgba(192,201,192,0.25)',
            animation: 'dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
          }}
          role="menu"
          aria-label="Profile menu"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-outline-variant/15">
            <p
              className="text-xs font-semibold text-on-surface truncate"
              style={{ fontFamily: 'Inter' }}
            >
              {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'}
            </p>
            <p
              className="text-[10px] text-on-surface-variant truncate mt-0.5"
              style={{ fontFamily: 'Inter' }}
            >
              {user?.email}
            </p>
            {isAdmin && (
              <span
                className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(254,214,91,0.25)',
                  color: 'var(--color-secondary)',
                  border: '1px solid rgba(115,92,0,0.2)',
                }}
              >
                {role}
              </span>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {/* Profile */}
            <button
              role="menuitem"
              onClick={() => { setOpen(false); navigate('/dashboard') }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-low transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span
                className="material-symbols-outlined text-on-surface-variant"
                style={{ fontSize: 18 }}
              >
                person
              </span>
              <span
                className="text-xs font-medium text-on-surface"
                style={{ fontFamily: 'Inter' }}
              >
                Profile
              </span>
            </button>

            {/* Admin Dashboard (only for admin/superadmin) */}
            {isAdmin && (
              <button
                role="menuitem"
                onClick={() => { setOpen(false); navigate('/admin') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-low transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: 18 }}
                >
                  admin_panel_settings
                </span>
                <span
                  className="text-xs font-medium text-primary"
                  style={{ fontFamily: 'Inter' }}
                >
                  Admin Dashboard
                </span>
              </button>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-outline-variant/15" />

            {/* Logout */}
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-error-container/30 transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span
                className="material-symbols-outlined text-error"
                style={{ fontSize: 18 }}
              >
                logout
              </span>
              <span
                className="text-xs font-medium text-error"
                style={{ fontFamily: 'Inter' }}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Dropdown animation */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
