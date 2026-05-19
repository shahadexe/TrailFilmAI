import { getGenAI } from './client'
import { buildStoryPrompt } from './prompts'
import type { StoryTone } from '@/types/database'
import type { GeneratedChapter, PhotoInput } from '@/types/gemini'

interface GeminiStoryResponse {
  chapters?: GeneratedChapter[]
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const CHUNK = 8192
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i += CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)))
  }
  return btoa(binary)
}

function validateChapters(chapters: GeneratedChapter[] | undefined): GeneratedChapter[] {
  if (!Array.isArray(chapters)) {
    throw new Error('Gemini response missing chapters array')
  }

  if (chapters.length < 1 || chapters.length > 6) {
    throw new Error(`Gemini returned ${chapters.length} chapters (expected 1-6)`)
  }

  for (const chapter of chapters) {
    if (
      typeof chapter.title !== 'string' ||
      typeof chapter.narrative !== 'string' ||
      !Array.isArray(chapter.photoIndices)
    ) {
      throw new Error('Gemini response contains an invalid chapter')
    }
    if (!chapter.photoIndices.every((i): i is number => typeof i === 'number' && i >= 1)) {
      throw new Error('Gemini response contains non-numeric or zero/negative photoIndices')
    }
  }

  return chapters
}

export async function generateStory(
  tripTitle: string,
  destination: string | null,
  photos: PhotoInput[],
  tone: StoryTone
): Promise<GeneratedChapter[]> {
  const prompt = buildStoryPrompt(tripTitle, destination, photos, tone)

  const imageParts = await Promise.all(
    photos.map(async (photo) => {
      const res = await fetch(photo.url)

      if (!res.ok) {
        throw new Error(`Failed to fetch photo ${photo.id}`)
      }

      const mimeType = res.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg'
      const buffer = await res.arrayBuffer()
      const data = arrayBufferToBase64(buffer)

      return {
        inlineData: {
          data,
          mimeType,
        },
      }
    })
  )

  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.8,
      responseMimeType: 'application/json',
    },
  })

  const result = await model.generateContent([prompt, ...imageParts])
  const text = result.response.text()
  const parsed = JSON.parse(text) as GeminiStoryResponse

  return validateChapters(parsed.chapters)
}
