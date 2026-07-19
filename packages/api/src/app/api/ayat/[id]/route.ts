import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/services/supabase-admin'
import { getAyatWithFallback } from '../../../../lib/services/quran-api'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params
    const ayatRefId = Number(id)
    if (Number.isNaN(ayatRefId)) {
      return NextResponse.json({ error: 'Invalid ayat_ref_id' }, { status: 400 })
    }

    const { data: ref } = await supabaseAdmin
      .from('ayat_refs')
      .select('surah_number, ayat_number')
      .eq('id', ayatRefId)
      .maybeSingle()

    if (!ref) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 })
    }

    const ayat = await getAyatWithFallback(ref.surah_number, ref.ayat_number)

    return NextResponse.json({
      surah_number: ref.surah_number,
      ayat_number: ref.ayat_number,
      arabic_text: ayat.arabicText,
      translation: ayat.translation,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'QuranApiError') {
      return NextResponse.json(
        { error: 'Quran source temporarily unavailable, please try again later.' },
        { status: 503 },
      )
    }
    console.error('[Ayat] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
