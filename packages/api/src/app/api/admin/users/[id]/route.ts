import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/services/supabase-admin'
import { requireRole, AuthError } from '../../../../../lib/middleware/require-role'
import { writeAuditLog } from '../../../../../lib/services/audit-log'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { userId } = await requireRole(request)
    const { id } = await params

    const body = (await request.json()) as {
      is_subscribed?: boolean
      role?: string
      is_active?: boolean
    }

    // Validate: at least one field to update
    if (body.is_subscribed === undefined && !body.role && body.is_active === undefined) {
      return NextResponse.json(
        { error: 'Provide at least one field to update: is_subscribed, role, or is_active' },
        { status: 400 },
      )
    }

    // Fetch current user state for audit log
    const { data: before } = await supabaseAdmin
      .from('users')
      .select('role, is_active, is_subscribed')
      .eq('id', id)
      .maybeSingle()

    if (!before) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update payload
    const update: Record<string, unknown> = {}
    if (body.is_subscribed !== undefined) update.is_subscribed = body.is_subscribed
    if (body.role) update.role = body.role
    if (body.is_active !== undefined) update.is_active = body.is_active

    const { error } = await supabaseAdmin
      .from('users')
      .update(update)
      .eq('id', id)

    if (error) throw error

    await writeAuditLog({
      adminId: userId,
      action: body.is_subscribed !== undefined
        ? (body.is_subscribed ? 'set_subscribed' : 'unset_subscribed')
        : body.role ? 'change_user_role' : 'toggle_user_active',
      targetTable: 'users',
      details: { user_id: id, before, after: { ...before, ...update } },
    })

    return NextResponse.json({ success: true, ...update })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Admin Users] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
