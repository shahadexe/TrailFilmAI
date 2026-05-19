import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStory } from '@/lib/gemini/generateStory'
import type { PhotoInput } from '@/types/gemini'
import type { Photo, StoryTone, Trip } from '@/types/database'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STORY_TONES: StoryTone[] = ['cinematic', 'poetic', 'adventurous', 'documentary']

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function isStoryTone(value: unknown): value is StoryTone {
  return typeof value === 'string' && STORY_TONES.includes(value as StoryTone)
}

export async function POST(req: NextRequest) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const { tripId, tone } = body as { tripId?: unknown; tone?: unknown }

  if (typeof tripId !== 'string' || !UUID_PATTERN.test(tripId)) {
    return jsonResponse({ error: 'Invalid trip id' }, 400)
  }

  if (!isStoryTone(tone)) {
    return jsonResponse({ error: 'Invalid story tone' }, 400)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (tripError || !trip) {
    return jsonResponse({ error: 'Trip not found' }, 404)
  }

  const { error: generatingError } = await supabase
    .from('trips')
    .update({ generation_status: 'generating' })
    .eq('id', tripId)

  if (generatingError) {
    return jsonResponse({ error: 'Could not start story generation' }, 500)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        const { data: photos, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .eq('trip_id', tripId)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true })

        if (photosError) throw photosError
        if (!photos || photos.length === 0) {
          throw new Error('No photos found for this trip')
        }

        const typedTrip = trip as Trip
        const typedPhotos = photos as Photo[]
        const photoInputs: PhotoInput[] = typedPhotos.map((photo) => ({
          id: photo.id,
          url: supabase.storage.from('trip-photos').getPublicUrl(photo.storage_path).data.publicUrl,
          takenAt: photo.taken_at ?? undefined,
          latitude: photo.latitude ?? undefined,
          longitude: photo.longitude ?? undefined,
          locationName: photo.location_name ?? undefined,
        }))

        let chapters
        let lastError: Error | null = null

        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            chapters = await generateStory(typedTrip.title, typedTrip.destination, photoInputs, tone)
            lastError = null
            break
          } catch (error) {
            lastError = error as Error
          }
        }

        if (!chapters) {
          throw lastError ?? new Error('Story generation failed')
        }

        const chapterInserts = chapters.map((c, index) => ({
          trip_id: tripId,
          chapter_index: index,
          title: c.title,
          narrative: c.narrative,
          photo_ids: c.photoIndices.map((idx) => {
            if (idx < 1 || idx > typedPhotos.length) {
              throw new Error(
                `Chapter "${c.title}" references photo index ${idx} but only ${typedPhotos.length} photos exist`
              )
            }
            return typedPhotos[idx - 1].id
          }),
          location_name:
            c.locationName ??
            (c.photoIndices[0]
              ? typedPhotos[c.photoIndices[0] - 1]?.location_name ?? null
              : null),
        }))

        const { error: deleteError } = await supabase
          .from('story_chapters')
          .delete().eq('trip_id', tripId)

        if (deleteError) throw deleteError

        const { error: insertError } = await supabase
          .from('story_chapters').insert(chapterInserts)

        if (insertError) throw insertError

        const { error: completedError } = await supabase
          .from('trips')
          .update({ generation_status: 'completed', story_tone: tone })
          .eq('id', tripId)

        if (completedError) throw completedError

        controller.enqueue(encoder.encode(JSON.stringify({ success: true })))
      } catch (error) {
        await supabase
          .from('trips')
          .update({ generation_status: 'failed' })
          .eq('id', tripId)

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Story generation failed',
            })
          )
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
