import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/services/supabase-admin'
import { requireRole, AuthError } from '../../../../lib/middleware/require-role'
import { writeAuditLog } from '../../../../lib/services/audit-log'

/* ── GET /api/admin/ayat-moods ── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request)

    const moodFilter = request.nextUrl.searchParams.get('mood')

    let query = supabaseAdmin
      .from('ayat_moods')
      .select('ayat_ref_id, mood, ayat_refs!inner(surah_number, ayat_number)')
      .order('mood', { ascending: true })

    if (moodFilter) {
      query = query.eq('mood', moodFilter)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin AyatMoods] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ── POST /api/admin/ayat-moods ── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireRole(request)
    const body = (await request.json()) as { ayat_ref_id?: number; mood?: string }

    const ayatRefId = Number(body.ayat_ref_id)
    const mood = body.mood?.trim().toLowerCase()

    if (!ayatRefId || !mood) {
      return NextResponse.json(
        { error: 'ayat_ref_id and mood are required' },
        { status: 400 },
      )
    }

    // Validate ayat_ref exists
    const { data: ref } = await supabaseAdmin
      .from('ayat_refs')
      .select('id')
      .eq('id', ayatRefId)
      .maybeSingle()

    if (!ref) {
      return NextResponse.json({ error: 'ayat_ref_id not found' }, { status: 400 })
    }

    // Validate mood exists in mood_tags
    const { data: tag } = await supabaseAdmin
      .from('mood_tags')
      .select('slug')
      .eq('slug', mood)
      .eq('is_active', true)
      .maybeSingle()

    if (!tag) {
      return NextResponse.json(
        { error: `Mood '${mood}' not found in mood_tags. Create it first via /api/admin/mood-tags` },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin
      .from('ayat_moods')
      .insert({ ayat_ref_id: ayatRefId, mood })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This mood mapping already exists' },
          { status: 409 },
        )
      }
      throw error
    }

    await writeAuditLog({
      adminId: userId,
      action: 'create_ayat_mood',
      targetTable: 'ayat_moods',
      details: { ayat_ref_id: ayatRefId, mood },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin AyatMoods] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ── DELETE /api/admin/ayat-moods ── */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireRole(request)

    const ayatRefId = Number(request.nextUrl.searchParams.get('ayat_ref_id'))
    const mood = request.nextUrl.searchParams.get('mood')?.trim().toLowerCase()

    if (!ayatRefId || !mood) {
      return NextResponse.json(
        { error: 'ayat_ref_id and mood query params are required' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin
      .from('ayat_moods')
      .delete()
      .eq('ayat_ref_id', ayatRefId)
      .eq('mood', mood)

    if (error) throw error

    await writeAuditLog({
      adminId: userId,
      action: 'delete_ayat_mood',
      targetTable: 'ayat_moods',
      details: { ayat_ref_id: ayatRefId, mood },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin AyatMoods] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
