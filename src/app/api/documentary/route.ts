import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVideoPrompts } from '@/lib/gemini/generateVideoPrompts'
import { generateAllScenes } from '@/lib/documentary/generateVeoVideo'

export const maxDuration = 300 // 5 minutes — Veo generation takes time

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { tripId?: string }
  const { tripId } = body

  if (!tripId) {
    return NextResponse.json({ error: 'tripId is required' }, { status: 400 })
  }

  // Verify trip ownership
  const { data: trip } = await supabase
    .from('trips')
    .select('id, title, generation_status')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  // Fetch photos with GPS + location for scene generation
  const { data: photos } = await supabase
    .from('photos')
    .select('id, storage_path, location_name, latitude, longitude, taken_at')
    .eq('trip_id', tripId)
    .order('order_index', { ascending: true })

  if (!photos || photos.length === 0) {
    return NextResponse.json({ error: 'No photos found for this trip' }, { status: 400 })
  }

  // Create documentary record
  const { data: documentary, error: insertError } = await supabase
    .from('documentaries')
    .insert({
      trip_id: tripId,
      user_id: user.id,
      status: 'processing',
      scene_count: Math.min(photos.length, 8),
    })
    .select('id')
    .single()

  if (insertError || !documentary) {
    return NextResponse.json({ error: 'Failed to create documentary record' }, { status: 500 })
  }

  const documentaryId = documentary.id

  // Update trip with latest documentary
  await supabase
    .from('trips')
    .update({ latest_documentary_id: documentaryId })
    .eq('id', tripId)

  // Build photo inputs with public URLs
  const photoInputs = photos.slice(0, 8).map((p) => ({
    id: p.id,
    url: supabase.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl,
    locationName: p.location_name,
    takenAt: p.taken_at,
  }))

  // Run pipeline asynchronously — respond immediately with documentary ID
  // The client polls /api/documentary/[id]/status
  runPipeline(documentaryId, trip.title, photoInputs, supabase).catch(async (err) => {
    console.error('Documentary pipeline error:', err)
    await supabase
      .from('documentaries')
      .update({ status: 'failed', error_message: String(err) })
      .eq('id', documentaryId)
  })

  return NextResponse.json({ documentaryId, status: 'processing' })
}

async function runPipeline(
  documentaryId: string,
  tripTitle: string,
  photos: { id: string; url: string; locationName: string | null; takenAt: string | null }[],
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  // Step 1: Generate cinematic prompts via Gemini 2.5 Pro
  const scenePrompts = await generateVideoPrompts(tripTitle, photos)

  // Step 2: Generate Veo 2 video for each scene
  const generatedScenes = await generateAllScenes(scenePrompts)

  const videoUrls = generatedScenes.map((s) => s.videoUrl)
  const sceneTitles = generatedScenes.map((s) => s.chapterTitle)

  // Step 3: Update documentary record as completed
  await supabase
    .from('documentaries')
    .update({
      status: 'completed',
      video_urls: videoUrls,
      scene_titles: sceneTitles,
      scene_count: videoUrls.length,
    })
    .eq('id', documentaryId)
}
