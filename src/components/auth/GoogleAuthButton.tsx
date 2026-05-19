'use client'

import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export const GoogleAuthButton = () => {
  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error('Google sign-in failed. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Try again.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="group flex w-full min-h-[44px] items-center justify-center gap-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-4 py-2.5 font-sans text-sm font-medium text-parchment-200 transition-all duration-300 ease-trailfilm hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)] hover:text-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 18 18"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
      </svg>
      <span>Continue with Google</span>
    </button>
  )
}
