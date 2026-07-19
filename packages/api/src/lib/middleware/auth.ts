import { createClient } from '@supabase/supabase-js'

/**
 * Extract the user ID from the request's Authorization header.
 * Returns null if the token is missing or invalid (anonymous user).
 */
export async function getUserIdOrNull(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)

  // Create an anon client just for token verification (no service_role needed)
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? ''

  if (!supabaseUrl || !supabaseAnonKey) return null

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}
