import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="font-serif text-[28px] font-medium tracking-[0.06em] text-ink-50 md:text-[40px]">
          Welcome.
        </h1>
        <p className="font-sans text-base text-[#E8E6DF]">Signed in as {user!.email}</p>
        <p className="font-sans text-sm text-[#B5B2A8]">Phase 2 will build the trip list here.</p>
      </div>
    </main>
  )
}
