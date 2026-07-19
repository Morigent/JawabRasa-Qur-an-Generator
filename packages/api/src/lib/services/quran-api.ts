const UMMAH_API_BASE = 'https://ummahapi.com/api/quran'
const UMMAH_API_KEY = process.env.UMMAH_API_KEY ?? ''

/* ── In-memory cache (resets on server restart; good enough for MVP) ── */
const cache = new Map<string, AyatResponse>()

export interface AyatResponse {
  surahNumber: number
  ayatNumber: number
  arabicText: string
  translation: string
}

export class QuranApiError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message ?? `Quran API returned status ${status}`)
    this.name = 'QuranApiError'
    this.status = status
  }
}

/* ── Primary: UmmahAPI ── */
async function fetchFromUmmahapi(surahNumber: number, ayatNumber: number): Promise<AyatResponse> {
  const url = `${UMMAH_API_BASE}/surah/${surahNumber}/ayah/${ayatNumber}`
  const headers: Record<string, string> = {}
  if (UMMAH_API_KEY) headers['X-API-Key'] = UMMAH_API_KEY

  console.log(`  [QuranAPI] Fetching ${surahNumber}:${ayatNumber} from UmmahAPI (primary) — no mock, real API call`)
  const res = await fetch(url, { headers })
  if (!res.ok) throw new QuranApiError(res.status)

  const json = (await res.json()) as {
    success?: boolean
    data?: {
      verse?: {
        arabic?: string
        translations?: Record<string, string>
      }
    }
  }

  const verse = json?.data?.verse

  return {
    surahNumber,
    ayatNumber,
    arabicText: verse?.arabic ?? '',
    translation: verse?.translations?.sahih_international ?? '',
  }
}

/* ── Fallback: alquran.cloud ── */
async function fetchFromAlquranCloud(surahNumber: number, ayatNumber: number): Promise<AyatResponse> {
  const url = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayatNumber}/editions/en.sahih,ar`
  const res = await fetch(url)
  if (!res.ok) throw new QuranApiError(res.status)

  const data = (await res.json()) as {
    data?: Array<{ edition?: { language?: string }; text?: string }>
  }

  const editions = data.data ?? []
  const arabic = editions.find((e) => e.edition?.language === 'ar')?.text ?? ''
  const translation = editions.find((e) => e.edition?.language === 'en')?.text ?? ''

  return { surahNumber, ayatNumber, arabicText: arabic, translation }
}

/* ── Public API ── */

export async function getAyatText(surahNumber: number, ayatNumber: number): Promise<AyatResponse> {
  const cacheKey = `ayat:${surahNumber}:${ayatNumber}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const ayat = await fetchFromUmmahapi(surahNumber, ayatNumber)
  cache.set(cacheKey, ayat)
  return ayat
}

export async function getAyatWithFallback(
  surahNumber: number,
  ayatNumber: number,
): Promise<AyatResponse> {
  try {
    return await getAyatText(surahNumber, ayatNumber)
  } catch (primaryErr) {
    console.warn(
      `[QuranAPI] Primary (UmmahAPI) failed for ${surahNumber}:${ayatNumber}, trying fallback.`,
      primaryErr instanceof Error ? primaryErr.message : String(primaryErr),
    )
    try {
      const ayat = await fetchFromAlquranCloud(surahNumber, ayatNumber)
      const cacheKey = `ayat:${surahNumber}:${ayatNumber}`
      cache.set(cacheKey, ayat)
      return ayat
    } catch {
      throw new QuranApiError(503, 'Both Quran APIs are unavailable. Please try again later.')
    }
  }
}

/**
 * Validate that a surah:ayat combination actually exists by calling the external API.
 * Used when an admin adds a new ayat_ref.
 */
export async function validateAyatExists(surahNumber: number, ayatNumber: number): Promise<boolean> {
  try {
    await fetchFromUmmahapi(surahNumber, ayatNumber)
    return true
  } catch {
    return false
  }
}
