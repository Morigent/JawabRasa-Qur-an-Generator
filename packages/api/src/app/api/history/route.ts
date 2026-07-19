import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/services/supabase-admin'
import { getUserIdOrNull } from '../../../lib/middleware/auth'
import { getAyatWithFallback } from '../../../lib/services/quran-api'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    /* ── Auth ── */
    const userId = await getUserIdOrNull(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    /* ── Fetch history from DB ── */
    const { data: rows, error } = await supabaseAdmin
      .from('user_ayat_history')
      .select(`
        id,
        mood,
        created_at,
        ayat_ref_id,
        ayat_refs!inner(surah_number, ayat_number)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[History] DB query failed:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    /* ── Enrich with verse text (best-effort) ── */
    const entries = await Promise.all(
      (rows ?? []).map(async (row) => {
        const refs = row.ayat_refs as unknown as { surah_number: number; ayat_number: number }
        let arabicText = ''
        let translation = ''

        try {
          const ayat = await getAyatWithFallback(refs.surah_number, refs.ayat_number)
          arabicText = ayat.arabicText
          translation = ayat.translation
        } catch {
          // verse text unavailable — user still sees reference + mood
        }

        return {
          id: row.id,
          mood: row.mood,
          reference: `Surah ${refs.surah_number}:${refs.ayat_number}`,
          surah_number: refs.surah_number,
          ayat_number: refs.ayat_number,
          arabic_text: arabicText,
          translation,
          created_at: row.created_at,
        }
      }),
    )

    return NextResponse.json({ entries })
  } catch (err) {
    const msg = err instanceof Error ? err.stack ?? err.message : String(err)
    console.error('[History] Unexpected error:', msg)
    return NextResponse.json(
      { error: 'Internal server error', detail: process.env.NODE_ENV === 'development' ? msg : undefined },
      { status: 500 },
    )
  }
}
