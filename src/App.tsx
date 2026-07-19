import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'

import { checkSupabaseConnection, supabase } from './lib/supabase'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import SignupPage         from './pages/SignupPage'
import DashboardPage      from './pages/DashboardPage'
import InboxPage          from './pages/InboxPage'
import ReflectPage        from './pages/ReflectPage'
import SubscriptionPage   from './pages/SubscriptionPage'
import AuthCallbackPage   from './pages/AuthCallbackPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AdminPage          from './pages/AdminPage'

/* ============================================================
   Protected route — redirects to /login if not authenticated
   ============================================================ */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    // Full-screen loading shimmer while session is being restored
    return (
      <div
        className="islamic-pattern"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 36, color: 'var(--color-primary)', animation: 'spin 1s linear infinite', display: 'block', marginBottom: '0.75rem' }}
          >
            progress_activity
          </span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
            Restoring your sanctuary…
          </p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/* ============================================================
   Admin-only guard — redirects to /dashboard if not admin/superadmin
   Uses supabase.rpc('is_admin') — SECURITY DEFINER, bypasses RLS.
   ============================================================ */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthContext()
  const location = useLocation()
  const [roleLoading, setRoleLoading] = React.useState(true)
  const [isAdmin, setIsAdmin]         = React.useState(false)

  React.useEffect(() => {
    if (!session) { setRoleLoading(false); return }

    // Use SECURITY DEFINER RPC — bypasses RLS recursive policy issue
    supabase
      .rpc('is_admin')
      .then(({ data, error }) => {
        if (error) {
          console.error('[RequireAdmin] is_admin() error:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(!!data)
        }
        setRoleLoading(false)
      })
  }, [session])

  if (loading || roleLoading) {
    return (
      <div
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}
      >
        <div style={{ textAlign: 'center' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 36, color: 'var(--color-primary)', animation: 'spin 1s linear infinite', display: 'block', marginBottom: '0.75rem' }}
          >
            progress_activity
          </span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
            Verifying admin access…
          </p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

/* ============================================================
   App root — router + DB health check
   ============================================================ */
function AppRoutes() {
  // Run DB health check on mount (logs to console)
  useEffect(() => {
    checkSupabaseConnection().then(({ ok, error }) => {
      if (ok) {
        console.info('[JAWAB RASA] ✅ Supabase database connection OK')
      } else {
        console.warn('[JAWAB RASA] ⚠️ Supabase connection issue:', error)
      }
    })
  }, [])

  return (
    <Routes>
      <Route path="/"                element={<LandingPage />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback"   element={<AuthCallbackPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/inbox"
        element={
          <RequireAuth>
            <InboxPage />
          </RequireAuth>
        }
      />
      <Route
        path="/reflect"
        element={
          <RequireAuth>
            <ReflectPage />
          </RequireAuth>
        }
      />
      <Route
        path="/subscription"
        element={
          <RequireAuth>
            <SubscriptionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
