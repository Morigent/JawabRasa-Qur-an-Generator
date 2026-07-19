import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/services/supabase-admin'
import { getUserIdOrNull } from '../../../lib/middleware/auth'
import { resolveMood } from '../../../lib/services/mood-resolver'
import { getAyatWithFallback } from '../../../lib/services/quran-api'
import { pickRelevantVerses } from '../../../lib/services/ai'
import { weightedPick, randomPick, type Candidate } from '../../../lib/services/mood-matching'
import { checkRateLimit } from '../../../lib/services/rate-limit'

interface GenerateRequest {
  mood?: string
}

interface CandidateRow {
  ayat_ref_id: number
  surah_number: number
  ayat_number: number
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const reqId = crypto.randomUUID().slice(0, 8)
    console.log(`\n══════ [Generate:${reqId}] Request started ══════`)

    /* ── 1. Parse body ── */
    const body = (await request.json()) as GenerateRequest
    const rawMood = body.mood?.trim()
    if (!rawMood) {
      return NextResponse.json({ error: 'mood is required' }, { status: 400 })
    }
    console.log(`[Generate:${reqId}] Step 1 — Mood input: "${rawMood}"`)

    /* ── 2. Auth ── */
    const userId = await getUserIdOrNull(request)
    console.log(`[Generate:${reqId}] Step 2 — Auth: ${userId ? `user ${userId.slice(0, 8)}…` : 'anonymous'}`)

    /* ── 3. Rate limit (anonymous only) ── */
    if (!userId) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? 'unknown'
      const cookie = request.headers.get('cookie') ?? ''
      const rateKey = `anon:${ip}:${cookie.slice(0, 32)}`

      const rateResult = checkRateLimit(rateKey, 5) // 5/day
      if (!rateResult.allowed) {
        console.log(`[Generate:${reqId}] Step 3 — Rate limit hit, returning 429`)
        return NextResponse.json(
          { error: 'Daily limit reached. Sign in for unlimited generates.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
              'X-RateLimit-Remaining': '0',
            },
          },
        )
      }
    }

    /* ── 4. Resolve mood ── */
    const resolved = await resolveMood(rawMood)
    const moodSlug = resolved.slug
    console.log(`[Generate:${reqId}] Step 4 — Resolved mood: "${rawMood}" → "${moodSlug}" (method: ${resolved.method})`)

    /* ── 5. Query candidates from DB ── */
    console.log(`[Generate:${reqId}] Step 5 — Querying ayat_moods WHERE mood = '${moodSlug}'`)
    const { data: candidates } = await supabaseAdmin
      .from('ayat_moods')
      .select('ayat_ref_id, ayat_refs!inner(surah_number, ayat_number)')
      .eq('mood', moodSlug) as { data: Array<{ ayat_ref_id: number; ayat_refs: { surah_number: number; ayat_number: number } }> | null }

    let candidateRows: CandidateRow[] = (candidates ?? []).map((c) => ({
      ayat_ref_id: c.ayat_ref_id,
      surah_number: c.ayat_refs.surah_number,
      ayat_number: c.ayat_refs.ayat_number,
    }))
    console.log(`[Generate:${reqId}] Step 5 — Found ${candidateRows.length} candidate(s) for '${moodSlug}'`)

    /* ── 5b. Fallback to 'general' mood ── */
    if (candidateRows.length === 0) {
      console.log(`[Generate:${reqId}] Step 5b — No candidates, falling back to 'general'`)
      const { data: fallback } = await supabaseAdmin
        .from('ayat_moods')
        .select('ayat_ref_id, ayat_refs!inner(surah_number, ayat_number)')
        .eq('mood', 'general') as { data: Array<{ ayat_ref_id: number; ayat_refs: { surah_number: number; ayat_number: number } }> | null }

      candidateRows = (fallback ?? []).map((c) => ({
        ayat_ref_id: c.ayat_ref_id,
        surah_number: c.ayat_refs.surah_number,
        ayat_number: c.ayat_refs.ayat_number,
      }))
      console.log(`[Generate:${reqId}] Step 5b — Found ${candidateRows.length} general candidate(s)`)
    }

    /* ── 5c. Last resort: pick a random verse from the DB ── */
    if (candidateRows.length === 0) {
      console.log(`[Generate:${reqId}] Step 5c — No general candidates either, picking random verse`)
      const { data: allRefs } = await supabaseAdmin
        .from('ayat_refs')
        .select('id, surah_number, ayat_number')

      if (allRefs && allRefs.length > 0) {
        const pick = allRefs[Math.floor(Math.random() * allRefs.length)]
        candidateRows = [{
          ayat_ref_id: pick.id,
          surah_number: pick.surah_number,
          ayat_number: pick.ayat_number,
        }]
        console.log(`[Generate:${reqId}] Step 5c — Last resort: picked ${pick.surah_number}:${pick.ayat_number}`)
      } else {
        console.log(`[Generate:${reqId}] Step 5c — DB has no ayat_refs at all, returning 500`)
        return NextResponse.json(
          { error: 'Content not yet available, please try again later.' },
          { status: 500 },
        )
      }
    }

    /* ── 6. AI ranking ── */
    console.log(`[Generate:${reqId}] Step 6 — Sending ${candidateRows.length} candidate(s) to Gemini AI for relevance ranking (mood: "${rawMood}")`)
    const aiSelectedIds = await pickRelevantVerses(
      candidateRows.map((c) => ({ ayatRefId: c.ayat_ref_id, surahNumber: c.surah_number, ayatNumber: c.ayat_number })),
      rawMood,
    )
    if (aiSelectedIds && aiSelectedIds.length > 0) {
      console.log(`[Generate:${reqId}] Step 6 — AI selected ${aiSelectedIds.length} verse(s): [${aiSelectedIds.join(', ')}]`)
    } else {
      console.log(`[Generate:${reqId}] Step 6 — AI returned null, falling back to random selection`)
    }

    /* ── 7. Narrow down to 5 candidates ── */
    let top5: CandidateRow[]
    if (aiSelectedIds && aiSelectedIds.length > 0) {
      // Preserve AI order, but only keep ones in our candidate list
      const idSet = new Set(aiSelectedIds)
      top5 = candidateRows.filter((c) => idSet.has(c.ayat_ref_id)).slice(0, 5)
    } else {
      // Fallback: random sample
      top5 = []
      const shuffled = [...candidateRows].sort(() => Math.random() - 0.5)
      for (let i = 0; i < Math.min(5, shuffled.length); i++) {
        top5.push(shuffled[i])
      }
    }

    if (top5.length === 0) {
      console.log(`[Generate:${reqId}] Step 7 — No candidates survived narrowing, returning 500`)
      return NextResponse.json(
        { error: 'Content not yet available, please try again later.' },
        { status: 500 },
      )
    }
    console.log(`[Generate:${reqId}] Step 7 — Top ${top5.length}: [${top5.map(c => `${c.surah_number}:${c.ayat_number}`).join(', ')}]`)

    /* ── 8. Weighted pick ── */
    let finalCandidate: CandidateRow

    if (userId && top5.length > 1) {
      // Fetch display history for the user
      const ayatRefIds = top5.map((c) => c.ayat_ref_id)
      const { data: history } = await supabaseAdmin
        .from('user_ayat_history')
        .select('ayat_ref_id, created_at')
        .eq('user_id', userId)
        .in('ayat_ref_id', ayatRefIds)
      console.log(`[Generate:${reqId}] Step 8 — User history check: ${history?.length ?? 0} previously shown`)

      const historyMap = new Map<number, Date>()
      if (history) {
        for (const h of history) {
          const existing = historyMap.get(h.ayat_ref_id)
          if (!existing || h.created_at > existing.toISOString()) {
            historyMap.set(h.ayat_ref_id, new Date(h.created_at))
          }
        }
      }

      const now = Date.now()
      const candidates: Candidate[] = top5.map((c) => {
        const lastShown = historyMap.get(c.ayat_ref_id)
        const lastShownDaysAgo = lastShown
          ? (now - lastShown.getTime()) / (1000 * 60 * 60 * 24)
          : null
        return { ayatRefId: c.ayat_ref_id, lastShownDaysAgo }
      })

      finalCandidate = top5[
        top5.findIndex((c) => c.ayat_ref_id === weightedPick(candidates).ayatRefId)
      ]
      console.log(`[Generate:${reqId}] Step 8 — Weighted pick → ${finalCandidate.surah_number}:${finalCandidate.ayat_number}`)
    } else {
      // Anonymous or single candidate: pure random
      const pick = randomPick(top5.map((c) => ({ ayatRefId: c.ayat_ref_id, lastShownDaysAgo: null })))
      finalCandidate = top5.find((c) => c.ayat_ref_id === pick.ayatRefId)!
      console.log(`[Generate:${reqId}] Step 8 — Random pick (${userId ? 'single candidate' : 'anonymous'}) → ${finalCandidate.surah_number}:${finalCandidate.ayat_number}`)
    }

    /* ── 9. Fetch verse text from external API ── */
    console.log(`[Generate:${reqId}] Step 9 — Fetching verse ${finalCandidate.surah_number}:${finalCandidate.ayat_number} from UmmahAPI…`)
    let ayatText: { arabicText: string; translation: string }
    try {
      ayatText = await getAyatWithFallback(finalCandidate.surah_number, finalCandidate.ayat_number)
      console.log(`[Generate:${reqId}] Step 9 — UmmahAPI succeeded (arabic: ${ayatText.arabicText.length}ch, translation: ${ayatText.translation.length}ch)`)
    } catch {
      console.log(`[Generate:${reqId}] Step 9 — Both UmmahAPI and fallback failed, returning 503`)
      return NextResponse.json(
        { error: 'Quran source temporarily unavailable, please try again later.' },
        { status: 503 },
      )
    }

    /* ── 10. Save history (logged-in users) ── */
    if (userId) {
      try {
        await supabaseAdmin.from('user_ayat_history').insert({
          user_id: userId,
          ayat_ref_id: finalCandidate.ayat_ref_id,
          mood: moodSlug,
        })
        console.log(`[Generate:${reqId}] Step 10 — History saved for user`)
      } catch (err) {
        console.warn(`[Generate:${reqId}] Step 10 — Failed to save history:`, err)
      }
    }

    /* ── 11. Return ── */
    console.log(`[Generate:${reqId}] ✅ Response sent — ${finalCandidate.surah_number}:${finalCandidate.ayat_number} (mood_resolved: "${moodSlug}")\n`)
    return NextResponse.json({
      surah_number: finalCandidate.surah_number,
      ayat_number: finalCandidate.ayat_number,
      arabic_text: ayatText.arabicText,
      translation: ayatText.translation,
      mood_resolved: moodSlug,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.stack ?? err.message : String(err)
    console.error('[Generate] Unexpected error:', msg)
    return NextResponse.json(
      { error: 'Internal server error', detail: process.env.NODE_ENV === 'development' ? msg : undefined },
      { status: 500 },
    )
  }
}
