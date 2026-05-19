import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  const { id: tripId, chapterId } = params

  if (!UUID_PATTERN.test(tripId) || !UUID_PATTERN.test(chapterId)) {
    return jsonResponse({ error: 'Invalid id' }, 400)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const { location_name, lat, lng } = body as {
    location_name?: unknown
    lat?: unknown
    lng?: unknown
  }

  if (location_name !== undefined && location_name !== null && typeof location_name !== 'string') {
    return jsonResponse({ error: 'location_name must be a string or null' }, 400)
  }

  if (lat !== undefined && lat !== null && typeof lat !== 'number') {
    return jsonResponse({ error: 'lat must be a number or null' }, 400)
  }

  if (lng !== undefined && lng !== null && typeof lng !== 'number') {
    return jsonResponse({ error: 'lng must be a number or null' }, 400)
  }

  // lat and lng must both be provided or both be null/absent
  const hasLat = lat !== undefined && lat !== null
  const hasLng = lng !== undefined && lng !== null
  if (hasLat !== hasLng) {
    return jsonResponse({ error: 'lat and lng must both be provided or both be null' }, 400)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  // Verify trip ownership
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (!trip) {
    return jsonResponse({ error: 'Trip not found' }, 404)
  }

  // Verify chapter belongs to this trip
  const { data: chapter } = await supabase
    .from('story_chapters')
    .select('id')
    .eq('id', chapterId)
    .eq('trip_id', tripId)
    .single()

  if (!chapter) {
    return jsonResponse({ error: 'Chapter not found' }, 404)
  }

  const { error } = await supabase
    .from('story_chapters')
    .update({ location_name: location_name ?? null })
    .eq('id', chapterId)

  if (error) {
    return jsonResponse({ error: 'Could not update chapter location' }, 500)
  }

  // If lat/lng provided, also update the first photo of this chapter so map coords persist
  if (hasLat && hasLng) {
    const { data: chapterRow } = await supabase
      .from('story_chapters')
      .select('photo_ids')
      .eq('id', chapterId)
      .single()

    const firstPhotoId = chapterRow?.photo_ids?.[0]
    if (firstPhotoId) {
      await supabase
        .from('photos')
        .update({ latitude: lat as number, longitude: lng as number, location_name: (location_name as string) ?? null })
        .eq('id', firstPhotoId)
    }
  }

  return jsonResponse({ success: true }, 200)
}
