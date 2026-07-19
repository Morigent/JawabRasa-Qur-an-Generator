import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey ||
    supabaseUrl === 'https://your-project-ref.supabase.co' ||
    supabaseAnonKey === 'your-anon-key-here') {
  console.error(
    '[JAWAB RASA] ⚠️ Supabase credentials not configured.\n' +
    'Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ── Health check ── */
export async function checkSupabaseConnection(): Promise<{
  ok: boolean
  tables: string[]
  error?: string
}> {
  try {
    // Ping a known table — returns empty rows but tells us the DB is alive
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows, that's fine
      return { ok: false, tables: [], error: error.message }
    }

    return { ok: true, tables: ['users'] }
  } catch (e: unknown) {
    return { ok: false, tables: [], error: String(e) }
  }
}
