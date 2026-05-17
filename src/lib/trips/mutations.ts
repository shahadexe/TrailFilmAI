import type { SupabaseClient } from '@supabase/supabase-js'
import type { Photo } from '@/types/database'

export async function createTrip(
  supabase: SupabaseClient,
  params: { user_id: string; title: string; destination: string | null }
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: params.user_id,
      title: params.title.trim(),
      destination: params.destination?.trim() || null,
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id }
}

export async function updateTripCover(
  supabase: SupabaseClient,
  tripId: string,
  photoId: string
): Promise<void> {
  const { error } = await supabase
    .from('trips')
    .update({ cover_photo_id: photoId })
    .eq('id', tripId)

  if (error) throw error
}

export async function deleteTrip(
  supabase: SupabaseClient,
  tripId: string,
  photos: Pick<Photo, 'storage_path'>[]
): Promise<void> {
  if (photos.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('trip-photos')
      .remove(photos.map((p) => p.storage_path))

    if (storageError) {
      // Non-throwing by design: storage orphans are preferable to DB orphans.
      // Log with path list so the failure is actionable (e.g. manual cleanup).
      console.error('[deleteTrip] Failed to remove storage files:', photos.map((p) => p.storage_path), storageError)
    }
  }

  const { error } = await supabase.from('trips').delete().eq('id', tripId)

  if (error) throw error
}
