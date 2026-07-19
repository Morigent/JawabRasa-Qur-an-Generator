export type Role = 'user' | 'admin' | 'superadmin'

export type VerifStatus = 'pending' | 'approved' | 'rejected'

export interface AppUser {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: Role
  is_active: boolean
  is_subscribed: boolean
  reflections_count: number
  created_at: string
}

export interface Consultant {
  id: number
  full_name: string
  bio: string | null
  photo_url: string | null
  specialization: string | null
  verification_status: VerifStatus
  is_paid_service: boolean
  price_per_session: number
  is_active: boolean
  created_at: string
}

export interface AuditLog {
  id: number
  admin_id: string
  action: string
  target_table: string | null
  target_id: number | null
  details: Record<string, unknown> | null
  created_at: string
  users?: { full_name: string; email: string }
}

export interface Reflection {
  id: number
  arabic: string
  translation: string
  reference: string
  mood: string
  tags: string[]
  createdAt: string
  dateLabel: string
}
