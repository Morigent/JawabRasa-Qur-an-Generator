/**
 * AuthContext — provides a single shared auth state for the entire app.
 *
 * Usage:
 *   1. Wrap your app with <AuthProvider> (done in App.tsx)
 *   2. Consume with useAuthContext() in any component
 */

import { createContext, useContext, type ReactNode } from 'react'
import { useAuth, type AuthState, type AuthActions } from '../hooks/useAuth'

/* ── Context type ── */
type AuthContextValue = AuthState & AuthActions

const AuthContext = createContext<AuthContextValue | null>(null)

/* ── Provider ── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/* ── Consumer hook ── */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>')
  }
  return ctx
}
