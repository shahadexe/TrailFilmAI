import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthWordmark } from '@/components/auth/AuthWordmark'
import { MagicLinkForm } from '@/components/auth/MagicLinkForm'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-16">
      <div className="flex w-full max-w-[400px] flex-col gap-8">
        <AuthWordmark />
        <MagicLinkForm />
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-ink-700" />
          <span className="font-sans text-xs text-parchment-600 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-ink-700" />
        </div>
        <GoogleAuthButton />
      </div>
    </main>
  )
}
