import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

/**
 * Send candidates + mood to Gemini for relevance ranking.
 * Returns an array of ayat_ref_id that the AI selected, or null on failure.
 */
export async function pickRelevantVerses(
  candidates: Array<{ ayatRefId: number; surahNumber: number; ayatNumber: number }>,
  mood: string,
): Promise<number[] | null> {
  if (candidates.length === 0) return null

  const candidateList = candidates
    .map((c) => `  { "ayat_ref_id": ${c.ayatRefId}, "surah": ${c.surahNumber}, "ayat": ${c.ayatNumber} }`)
    .join('\n')

  const prompt = `You are a Qur'anic verse selector. Given a user's mood and a list of candidate verses, pick the 5 most relevant verses for that mood.

User's mood: "${mood}"

Candidates:
${candidateList}

Reply with ONLY a JSON array of the 5 ayat_ref_id values you selected, sorted by relevance (most relevant first). Example: [12, 45, 78, 23, 67]
DO NOT include any id outside this list. DO NOT add any explanation.`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    const parsed: unknown = JSON.parse(text)

    if (!Array.isArray(parsed)) return null

    const ids = parsed
      .filter((id): id is number => typeof id === 'number')
      .slice(0, 5)

    // Validate: every id must exist in the original candidate list
    const validIds = new Set(candidates.map((c) => c.ayatRefId))
    const validated = ids.filter((id) => validIds.has(id))

    return validated.length > 0 ? validated : null
  } catch (err) {
    console.warn('[AI] pickRelevantVerses failed:', err instanceof Error ? err.message : String(err))
    return null
  }
}
