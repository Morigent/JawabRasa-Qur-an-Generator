import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/services/supabase-admin'

interface SeedUser {
  email: string
  password: string
  fullName: string
  role: 'user' | 'admin' | 'superadmin'
}

const TEST_USERS: SeedUser[] = [
  { email: 'superadmin@test.com',  password: 'Test123!', fullName: 'Aisha Rahman',    role: 'superadmin' },
  { email: 'admin@test.com',       password: 'Test123!', fullName: 'Bilal Hassan',    role: 'admin'      },
  { email: 'user1@test.com',       password: 'Test123!', fullName: 'Fatima Zahra',    role: 'user'       },
  { email: 'user2@test.com',       password: 'Test123!', fullName: 'Yusuf Ibrahim',   role: 'user'       },
  { email: 'user3@test.com',       password: 'Test123!', fullName: 'Layla Mahmoud',   role: 'user'       },
]

/**
 * POST /api/seed — creates test auth users + ayat history.
 * Safe to re-run (skips existing users by email).
 */
export async function POST(): Promise<NextResponse> {
  const supabase = supabaseAdmin
  const created: string[] = []
  const errors: string[] = []

  for (const u of TEST_USERS) {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', u.email)
      .maybeSingle()

    if (existing) {
      created.push(`${u.email} (already exists)`)
      continue
    }

    // Create auth user (trigger auto-creates public.users row)
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName },
    })

    if (authErr || !authUser?.user) {
      errors.push(`${u.email}: ${authErr?.message ?? 'no user returned'}`)
      continue
    }

    // Set role
    const { error: roleErr } = await supabase
      .from('users')
      .update({ role: u.role })
      .eq('id', authUser.user.id)

    if (roleErr) errors.push(`${u.email}: role update failed - ${roleErr.message}`)

    created.push(u.email)
  }

  return NextResponse.json({ created, errors, count: created.length })
}
