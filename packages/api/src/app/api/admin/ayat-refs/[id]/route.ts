import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/services/supabase-admin'
import { requireRole, AuthError } from '../../../../../lib/middleware/require-role'
import { validateAyatExists } from '../../../../../lib/services/quran-api'
import { writeAuditLog } from '../../../../../lib/services/audit-log'

async function getAyatRefId(params: Promise<{ id: string }>): Promise<number> {
  const { id } = await params
  const num = Number(id)
  if (Number.isNaN(num)) throw new Error('Invalid id')
  return num
}

/* ── PUT /api/admin/ayat-refs/[id] ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { userId } = await requireRole(request)
    const ayatRefId = await getAyatRefId(params)

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

    const { data: old } = await supabaseAdmin
      .from('ayat_refs')
      .select('surah_number, ayat_number')
      .eq('id', ayatRefId)
      .maybeSingle()

    if (!old) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('ayat_refs')
      .update({
        surah_number: surah,
        ayat_number: ayat,
        validated_against_api: true,
        validated_at: new Date().toISOString(),
      })
      .eq('id', ayatRefId)
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
      action: 'update_ayat_ref',
      targetTable: 'ayat_refs',
      targetId: ayatRefId,
      details: { before: old, after: { surah_number: surah, ayat_number: ayat } },
    })

    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin AyatRefs] PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ── DELETE /api/admin/ayat-refs/[id] ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { userId } = await requireRole(request)
    const ayatRefId = await getAyatRefId(params)

    // Check for references before deleting
    const { count: moodCount } = await supabaseAdmin
      .from('ayat_moods')
      .select('*', { count: 'exact', head: true })
      .eq('ayat_ref_id', ayatRefId)

    if (moodCount && moodCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: still used in ${moodCount} mood mapping(s)` },
        { status: 409 },
      )
    }

    const { error } = await supabaseAdmin
      .from('ayat_refs')
      .delete()
      .eq('id', ayatRefId)

    if (error) throw error

    await writeAuditLog({
      adminId: userId,
      action: 'delete_ayat_ref',
      targetTable: 'ayat_refs',
      targetId: ayatRefId,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin AyatRefs] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
