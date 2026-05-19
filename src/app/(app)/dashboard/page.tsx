import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripCardGrid } from '@/components/trip/TripCardGrid'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import type { Trip } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // (app)/layout.tsx already redirects unauthenticated users — this is defense-in-depth.
  // Explicit null check handles the narrow window where the session expires between layout
  // and page auth calls (token refresh timing, clock skew).
  if (!user) redirect('/login')

  const { data: rows, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (tripsError) {
    console.error('[dashboard] trips query failed:', tripsError)
  }

  const tripRows = rows ?? []

  // Fetch cover photo storage paths for trips that have a cover_photo_id
  const coverPhotoIds = tripRows
    .map((r) => r.cover_photo_id)
    .filter(Boolean) as string[]

  const coverMap: Record<string, string> = {}
  if (coverPhotoIds.length > 0) {
    const { data: coverPhotos, error: coverError } = await supabase
      .from('photos')
      .select('id, storage_path')
      .in('id', coverPhotoIds)

    if (coverError) {
      console.error('[dashboard] cover photos query failed:', coverError)
    }

    for (const photo of coverPhotos ?? []) {
      coverMap[photo.id] = supabase.storage
        .from('trip-photos')
        .getPublicUrl(photo.storage_path).data.publicUrl
    }
  }

  const trips = tripRows.map((row: Trip) => ({
    trip: row,
    coverUrl: row.cover_photo_id ? (coverMap[row.cover_photo_id] ?? null) : null,
  }))

  const count = trips.length

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <DashboardHeader count={count} />
      <TripCardGrid trips={trips} />
    </div>
  )
}
