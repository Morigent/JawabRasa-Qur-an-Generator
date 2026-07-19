import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/services/supabase-admin'
import { requireRole, AuthError } from '../../../../lib/middleware/require-role'
import { validateAyatExists } from '../../../../lib/services/quran-api'
import { writeAuditLog } from '../../../../lib/services/audit-log'

/* ── GET /api/admin/ayat-refs ── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request)
    const surahFilter = request.nextUrl.searchParams.get('surah_number')

    let query = supabaseAdmin
      .from('ayat_refs')
      .select('id, surah_number, ayat_number, validated_against_api, validated_at, created_at')
      .order('surah_number', { ascending: true })
      .order('ayat_number', { ascending: true })

    if (surahFilter) {
      query = query.eq('surah_number', Number(surahFilter))
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin AyatRefs] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ── POST /api/admin/ayat-refs ── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireRole(request)
    const body = (await request.json()) as { surah_number?: number; ayat_number?: number }

    const surah = Number(body.surah_number)
    const ayat = Number(body.ayat_number)

    if (!surah || !ayat || surah < 1 || surah > 114 || ayat < 1) {
      return NextResponse.json(
        { error: 'surah_number (1-114) and ayat_number (>0) are required' },
        { status: 400 },
      )
    }

    // Validate against external API
    const exists = await validateAyatExists(surah, ayat)
    if (!exists) {
      return NextResponse.json(
        { error: `Verse ${surah}:${ayat} does not exist in the Quran` },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ayat_refs')
      .insert({
        surah_number: surah,
        ayat_number: ayat,
        validated_against_api: true,
        validated_at: new Date().toISOString(),
      })
      .select('id, surah_number, ayat_number')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Surah ${surah}:${ayat} already exists` },
          { status: 409 },
        )
      }
      throw error
    }

    await writeAuditLog({
      adminId: userId,
      action: 'create_ayat_ref',
      targetTable: 'ayat_refs',
      targetId: data.id,
      details: { surah_number: surah, ayat_number: ayat },
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin AyatRefs] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
