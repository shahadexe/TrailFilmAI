import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripDetailHeader } from '@/components/trip/TripDetailHeader'
import { TripPhotoGrid, type PhotoWithUrl } from '@/components/trip/TripPhotoGrid'

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Defense-in-depth: (app)/layout.tsx already redirects unauthenticated visitors.
  // If user is null for any reason (token expiry, timing), render 404 instead of crashing.
  if (!user) notFound()

  // Two-layer ownership filter: RLS (auth.uid() = user_id) + explicit eq for T-02-19 defense-in-depth.
  // Collapsing wrong-id and wrong-owner into the same notFound() prevents information disclosure.
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!trip) notFound()

  // Photos ordered by order_index (primary), created_at (tie-breaker for retried uploads).
  const { data: photoRows } = await supabase
    .from('photos')
    .select('*')
    .eq('trip_id', params.id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  // Derive public URLs server-side — getPublicUrl is synchronous, never errors.
  // Matches the dashboard cover URL pattern (Plan 02).
  const photos: PhotoWithUrl[] = (photoRows ?? []).map((p) => ({
    ...p,
    publicUrl: supabase.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl,
  }))

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <TripDetailHeader trip={trip} />

      {photos.length > 0 ? (
        <TripPhotoGrid photos={photos} />
      ) : (
        <p className="mt-12 font-sans text-base text-parchment-400">No photos yet.</p>
      )}
    </div>
  )
}
