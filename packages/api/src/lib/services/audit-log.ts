import { supabaseAdmin } from './supabase-admin'

export interface AuditLogPayload {
  adminId: string
  action: string
  targetTable?: string
  targetId?: number
  details?: Record<string, unknown>
}

/**
 * Write an entry to the admin_audit_logs table.
 * Fire-and-forget — never throws.
 */
export async function writeAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    await supabaseAdmin.from('admin_audit_logs').insert({
      admin_id: payload.adminId,
      action: payload.action,
      target_table: payload.targetTable ?? null,
      target_id: payload.targetId ?? null,
      details: payload.details ?? null,
    })
  } catch (err) {
    console.warn('[AuditLog] Failed to write:', err)
  }
}
