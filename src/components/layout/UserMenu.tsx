'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  email: string
}

export function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const initial = email[0]?.toUpperCase() ?? '?'

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleSignOut() {
    setPending(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('[UserMenu] sign-out failed:', err)
    } finally {
      setPending(false)
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        id="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu-dropdown"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-ink-700 font-sans text-[13px] font-medium text-amber-accent transition-colors duration-300 ease-trailfilm hover:border-[rgba(229,166,99,0.4)] hover:bg-ink-800"
      >
        {initial}
      </button>

      {open && (
        <div
          id="user-menu-dropdown"
          role="menu"
          aria-labelledby="user-menu-trigger"
          className="absolute right-0 top-11 z-50 w-52 rounded-lg border border-ink-700 bg-ink-800 py-1 shadow-none"
        >
          <p className="truncate px-4 py-2 font-sans text-[12px] text-parchment-400">{email}</p>
          <div className="mx-2 h-px bg-ink-700" />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={pending}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 font-sans text-[13px] font-medium text-parchment-400 transition-colors duration-200 hover:bg-ink-700 hover:text-ink-50 disabled:opacity-50"
          >
            <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
            {pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
