import { getGenAI } from './client'
import { arrayBufferToBase64 } from './generateStory'

export interface ScenePrompt {
  index: number
  photoId: string
  photoUrl: string
  cinematicPrompt: string
  chapterTitle: string
  locationHint: string | null
}

interface PhotoInputForDocumentary {
  id: string
  url: string
  locationName?: string | null
  takenAt?: string | null
}

interface GeminiScenesResponse {
  scenes?: Array<{
    index: number
    cinematicPrompt: string
    chapterTitle: string
  }>
}

const SCENE_PROMPT = (tripTitle: string, photos: PhotoInputForDocumentary[]) => `
You are a world-class cinematic director creating a breathtaking travel documentary for: "${tripTitle}".

You have ${photos.length} travel photo${photos.length > 1 ? 's' : ''}.

For EACH photo, write a vivid cinematic Veo 2 video generation prompt that will produce a 6-second cinematic clip.
The clips will be assembled into a stunning short-form travel documentary.

Rules for each prompt:
- Focus on MOTION and ATMOSPHERE — camera movements, light behavior, environmental energy
- Reference the specific visual elements visible in the photo
- Include cinematic camera direction: "slow dolly in", "drone reveal", "handheld tracking", "parallax pan", "time-lapse clouds", etc.
- Include atmospheric details: golden hour light, mist, haze, reflections, crowds in motion, wind in trees
- Keep prompts under 120 words — Veo works best with focused, vivid descriptions
- Do NOT mention text, titles, or subtitles
- Style guide: cinematic, warm tones, shallow depth of field, film grain, 4K quality

Also provide a short chapter title (3-6 words, Fraunces serif feel).

Respond with ONLY valid JSON:
{
  "scenes": [
    {
      "index": 1,
      "cinematicPrompt": "...",
      "chapterTitle": "..."
    }
  ]
}
`

export async function generateVideoPrompts(
  tripTitle: string,
  photos: PhotoInputForDocumentary[]
): Promise<ScenePrompt[]> {
  if (photos.length === 0) return []

  // Limit to 8 photos for Gemini context window (Veo cost management)
  const selectedPhotos = photos.slice(0, 8)

  const imageParts = await Promise.all(
    selectedPhotos.map(async (photo) => {
      const res = await fetch(photo.url)
      if (!res.ok) throw new Error(`Failed to fetch photo ${photo.id}`)
      const mimeType = res.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg'
      const buffer = await res.arrayBuffer()
      const data = arrayBufferToBase64(buffer)
      return { inlineData: { data, mimeType } }
    })
  )

  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.85,
      responseMimeType: 'application/json',
    },
  })

  const result = await model.generateContent([
    SCENE_PROMPT(tripTitle, selectedPhotos),
    ...imageParts,
  ])

  const text = result.response.text()
  const parsed = JSON.parse(text) as GeminiScenesResponse

  if (!Array.isArray(parsed.scenes)) {
    throw new Error('Gemini returned invalid scenes response')
  }

  return parsed.scenes.map((s, i) => ({
    index: s.index ?? i + 1,
    photoId: selectedPhotos[i]?.id ?? '',
    photoUrl: selectedPhotos[i]?.url ?? '',
    cinematicPrompt: s.cinematicPrompt,
    chapterTitle: s.chapterTitle,
    locationHint: selectedPhotos[i]?.locationName ?? null,
  }))
}
