import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getSupabaseUrl(): string {
  return process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
}

function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
}

/**
 * Lazy-init server-side Supabase client with service_role key — bypasses RLS.
 * Only throws when first actually used, not at import time.
 */
function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = getSupabaseUrl()
  const supabaseServiceKey = getSupabaseServiceKey()

  if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
    throw new Error(
      '[JAWAB RASA API] SUPABASE_URL is not configured. ' +
      'Set VITE_SUPABASE_URL or SUPABASE_URL in .env.local'
    )
  }
  if (!supabaseServiceKey) {
    throw new Error(
      '[JAWAB RASA API] SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
      'Set it in .env.local to enable server-side DB access.'
    )
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

/**
 * Proxy wrapper — delegates all property access to the lazy-initialized client.
 * Allows transparent usage like supabaseAdmin.from('table').select(...).
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
