import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripWizard } from '@/components/upload/TripWizard'

export default async function NewTripPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login') // defense in depth — (app)/layout.tsx also guards

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[480px] flex flex-col gap-8">
        <TripWizard userId={user.id} />
      </div>
    </main>
  )
}
