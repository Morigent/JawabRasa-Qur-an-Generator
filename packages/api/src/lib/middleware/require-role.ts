import { supabaseAdmin } from '../services/supabase-admin'
import { getUserIdOrNull } from './auth'

type Role = 'admin' | 'superadmin'

/**
 * Check if the request's Bearer token corresponds to a user with the required role.
 * Returns the user ID on success, or throws a specific error on failure.
 */
export async function requireRole(
  request: Request,
  minRole: Role = 'admin',
): Promise<{ userId: string; role: string }> {
  const userId = await getUserIdOrNull(request)
  if (!userId) {
    throw new AuthError('Authentication required', 401)
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (!user) {
    throw new AuthError('User not found', 401)
  }

  if (minRole === 'superadmin' && user.role !== 'superadmin') {
    throw new AuthError('Superadmin access required', 403)
  }
  if (minRole === 'admin' && !['admin', 'superadmin'].includes(user.role)) {
    throw new AuthError('Admin access required', 403)
  }

  return { userId, role: user.role as string }
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}
