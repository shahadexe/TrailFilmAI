import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNavWrapper } from '@/components/layout/AppNavWrapper'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-ink text-ink-50">
      <AppNavWrapper userEmail={user.email ?? ''} />
      <main>{children}</main>
    </div>
  )
}
