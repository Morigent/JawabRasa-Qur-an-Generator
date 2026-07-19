import { supabaseAdmin } from './supabase-admin'

interface MoodResult {
  slug: string
  method: 'exact' | 'synonym' | 'fuzzy' | 'ai' | 'unresolved'
  confidence?: number
}

/**
 * Resolve a free-text mood input to a canonical mood slug.
 *
 * Strategy (cheapest → most expensive):
 *   1. Exact match against mood_tags.slug
 *   2. Synonym match     against mood_synonyms
 *   3. Fuzzy match       via pg_trgm similarity()
 *   4. Unresolved        → fallback to 'general'
 */
export async function resolveMood(rawInput: string): Promise<MoodResult> {
  const normalized = rawInput.trim().toLowerCase()
  if (!normalized) return { slug: 'general', method: 'unresolved' }

  // 1. Exact match
  const { data: exact } = await supabaseAdmin
    .from('mood_tags')
    .select('slug')
    .eq('slug', normalized)
    .eq('is_active', true)
    .maybeSingle()
  if (exact) {
    await logResolution(normalized, exact.slug, 'exact')
    return { slug: exact.slug, method: 'exact' }
  }

  // 2. Synonym match
  const { data: synonym } = await supabaseAdmin
    .from('mood_synonyms')
    .select('mood_slug')
    .eq('synonym', normalized)
    .maybeSingle()
  if (synonym) {
    await logResolution(normalized, synonym.mood_slug, 'synonym')
    return { slug: synonym.mood_slug, method: 'synonym' }
  }

  // 3. Fuzzy match via pg_trgm
  const { data: fuzzy } = await supabaseAdmin.rpc('fuzzy_match_mood', {
    input: normalized,
    threshold: 0.35,
  })
  if (fuzzy && fuzzy.length > 0) {
    const best = fuzzy[0] as { slug: string; score: number }
    await logResolution(normalized, best.slug, 'fuzzy', best.score)
    return { slug: best.slug, method: 'fuzzy', confidence: best.score }
  }

  // 4. Unresolved → fallback
  await logResolution(normalized, null, 'unresolved')
  return { slug: 'general', method: 'unresolved' }
}

/* ── Logging (fire-and-forget) ── */
async function logResolution(
  rawInput: string,
  resolvedSlug: string | null,
  method: MoodResult['method'],
  confidence?: number,
): Promise<void> {
  try {
    await supabaseAdmin.from('mood_resolution_logs').insert({
      raw_input: rawInput,
      resolved_slug: resolvedSlug,
      method,
      confidence: confidence ?? null,
    })
  } catch (err) {
    console.warn('[MoodResolver] Failed to log resolution:', err)
  }
}
