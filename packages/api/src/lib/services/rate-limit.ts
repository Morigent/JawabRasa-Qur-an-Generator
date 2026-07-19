/* ── Simple in-memory rate limiter (Redis will replace this in production) ── */

interface RateLimitEntry {
  count: number
  resetAt: number // epoch ms
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given key.
 *
 * @param key   Unique identifier (e.g. "ip:1.2.3.4" or "user:uuid")
 * @param limit Max requests per window
 * @param windowMs  Window duration in ms (default: 24 hours)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 24 * 60 * 60 * 1000,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // First request or window expired → reset
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
