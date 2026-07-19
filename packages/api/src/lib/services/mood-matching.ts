export interface Candidate {
  ayatRefId: number
  lastShownDaysAgo: number | null // null = never shown
}

/**
 * Weighted random pick from 5 AI-chosen candidates.
 *
 * Weights:
 *   - never shown (null)  → 3
 *   - >30 days ago        → 2
 *   - >7 days ago         → 1
 *   - ≤7 days ago         → 0.3
 *
 * For anonymous users (no history), all candidates have null → equal weight.
 */
export function weightedPick(candidates: Candidate[]): Candidate {
  const weights = candidates.map((c) => {
    if (c.lastShownDaysAgo === null) return 3
    if (c.lastShownDaysAgo > 30) return 2
    if (c.lastShownDaysAgo > 7) return 1
    return 0.3
  })

  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]
    if (r <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

/**
 * Pure random pick (fallback when AI output is invalid).
 */
export function randomPick(candidates: Candidate[]): Candidate {
  return candidates[Math.floor(Math.random() * candidates.length)]
}
