import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/services/supabase-admin'
import { requireRole, AuthError } from '../../../../lib/middleware/require-role'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request)

    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('pageSize')) || 20))
    const search = request.nextUrl.searchParams.get('search')?.trim() ?? ''
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabaseAdmin
      .from('users')
      .select('id, full_name, email, avatar_url, role, is_active, is_subscribed, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin Users] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
