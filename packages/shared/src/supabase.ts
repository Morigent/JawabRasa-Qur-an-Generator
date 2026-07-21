import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const isConfigured = !!(supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here')

/**
 * Lazy-init Supabase client. Returns a noop proxy when unconfigured
 * so the app doesn't crash on missing env vars.
 */
function createSafeClient(): SupabaseClient {
  if (!isConfigured) {
    console.error(
      '[JAWAB RASA] ⚠️ Supabase credentials not configured.\n' +
      'Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    )
  }
  return createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
    isConfigured ? supabaseAnonKey : 'placeholder-key',
  )
}

export const supabase = createSafeClient()

/* ── Health check ── */
export async function checkSupabaseConnection(): Promise<{
  ok: boolean
  tables: string[]
  error?: string
}> {
  if (!isConfigured) {
    return { ok: false, tables: [], error: 'Supabase credentials not configured.' }
  }
  try {
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      return { ok: false, tables: [], error: error.message }
    }

    return { ok: true, tables: ['users'] }
  } catch (e: unknown) {
    return { ok: false, tables: [], error: String(e) }
  }
}
