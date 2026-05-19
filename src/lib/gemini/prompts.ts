import type { StoryTone } from '@/types/database'
import type { PhotoInput } from '@/types/gemini'

export const STORY_TONES = {
  cinematic: {
    label: 'Cinematic',
    description: 'Like a Nat Geo documentary',
    instruction:
      'Write in the style of a National Geographic documentary or a slow-burn travel film. Use vivid sensory imagery - sounds, scents, the quality of light. Sentences should breathe; vary length. Avoid cliches like "magical" or "amazing".',
  },
  poetic: {
    label: 'Poetic',
    description: 'Lyrical and reflective',
    instruction:
      'Write in a lyrical, reflective tone reminiscent of literary travel writing. Use metaphor sparingly but with weight. Think Pico Iyer or Pankaj Mishra travelling through India. Embrace stillness and small details.',
  },
  adventurous: {
    label: 'Adventurous',
    description: 'Bold and energetic',
    instruction:
      'Write with momentum and energy. Short, punchy sentences. Action verbs. The reader should feel the wind, the climb, the rush. Think backpacker diary meets adventure magazine.',
  },
  documentary: {
    label: 'Documentary',
    description: 'Observational and grounded',
    instruction:
      "Write as a thoughtful observer documenting a place. Specific, factual, grounded. Avoid emotional flourishes. Let the details speak. Think Anthony Bourdain's voiceover style.",
  },
} as const

export function buildStoryPrompt(
  tripTitle: string,
  destination: string | null,
  photos: PhotoInput[],
  tone: StoryTone
): string {
  const toneInstruction = STORY_TONES[tone].instruction

  return `You are a world-class travel storyteller writing a cinematic journal of a user's trip${destination ? ` to ${destination}` : ''}.

TRIP TITLE: "${tripTitle}"
NUMBER OF PHOTOS: ${photos.length}
TONE: ${STORY_TONES[tone].label}

TONE INSTRUCTION:
${toneInstruction}

PHOTO METADATA (in order):
${photos.map((p, i) => `Photo ${i + 1}: ${p.locationName || 'Unknown location'}${p.takenAt ? `, taken ${p.takenAt}` : ''}${p.latitude && p.longitude ? ` (${p.latitude.toFixed(3)}, ${p.longitude.toFixed(3)})` : ''}`).join('\n')}

YOUR TASK:
Look at every photo carefully. Notice what's in them - landscapes, people, food, weather, mood. Then write a multi-chapter narrative of this trip.

OUTPUT RULES:
1. Produce 3-6 chapters depending on photo count and natural narrative breaks.
2. Each chapter groups 2-8 thematically related photos.
3. Each chapter has:
   - A short evocative title (3-6 words, no cliches like "Magical Moments")
   - A narrative of 80-150 words in the specified tone
   - A list of photo indices (1-indexed) belonging to this chapter
   - An optional location name if discernible
4. Do NOT mention "the user" or "you". Write as if the reader IS the traveller.
5. Do NOT use emoji.
6. Do NOT include hashtags.
7. Indian places: respect cultural names. "Varanasi" not "Benares". "Kolkata" not "Calcutta". "Bengaluru" not "Bangalore" unless context demands.
8. Describe only what you actually observe in each photo — specific colors, subjects, moments. If a photo is unclear, describe the mood, light, or setting rather than inventing specific subjects. Never generalize about a type of place as if you haven't seen the image.

OUTPUT FORMAT - return ONLY valid JSON, no markdown, no preamble:

{
  "chapters": [
    {
      "title": "string",
      "narrative": "string (80-150 words)",
      "photoIndices": [1, 2, 3],
      "locationName": "string or null"
    }
  ]
}
`
}
