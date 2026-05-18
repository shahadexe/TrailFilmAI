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

  const { data: rows } = await supabase
    .from('trips')
    .select('*, cover:photos!cover_photo_id(id, storage_path)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const trips = (rows ?? []).map(
    (row: Trip & { cover: { storage_path: string } | null }) => {
      const coverUrl = row.cover
        ? supabase.storage
            .from('trip-photos')
            .getPublicUrl(row.cover.storage_path).data.publicUrl
        : null
      const { cover: _cover, ...trip } = row
      return { trip: trip as Trip, coverUrl }
    }
  )

  const count = trips.length

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <DashboardHeader count={count} />
      <TripCardGrid trips={trips} />
    </div>
  )
}
