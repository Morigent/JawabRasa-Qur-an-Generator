import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/services/supabase-admin'
import { requireRole, AuthError } from '../../../../lib/middleware/require-role'
import { writeAuditLog } from '../../../../lib/services/audit-log'

/* ── GET /api/admin/mood-tags ── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request)

    const { data, error } = await supabaseAdmin
      .from('mood_tags')
      .select('slug, label, is_active')
      .order('label', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin MoodTags] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ── POST /api/admin/mood-tags ── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireRole(request)
    const body = (await request.json()) as { slug?: string; label?: string }

    const slug = body.slug?.trim().toLowerCase()
    const label = body.label?.trim()

    if (!slug || !label) {
      return NextResponse.json(
        { error: 'slug and label are required' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('mood_tags')
      .insert({ slug, label })
      .select('slug, label, is_active')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Mood tag '${slug}' already exists` },
          { status: 409 },
        )
      }
      throw error
    }

    await writeAuditLog({
      adminId: userId,
      action: 'create_mood_tag',
      targetTable: 'mood_tags',
      details: { slug, label },
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin MoodTags] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
