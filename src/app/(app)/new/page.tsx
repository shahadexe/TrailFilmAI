import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripWizard } from '@/components/upload/TripWizard'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login') // defense in depth — (app)/layout.tsx also guards

  const rawTripId = searchParams.tripId
  const tripId = typeof rawTripId === 'string' && UUID_PATTERN.test(rawTripId) ? rawTripId : null
  const rawResume = searchParams.resume

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[480px] flex flex-col gap-8">
        <TripWizard
          userId={user.id}
          resumeTripId={tripId}
          resumeStep={rawResume === '3' ? 3 : undefined}
        />
      </div>
    </main>
  )
}
