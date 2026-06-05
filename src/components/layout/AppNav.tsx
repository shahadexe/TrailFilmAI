import Link from 'next/link'
import { Plus, Globe } from 'lucide-react'
import { UserMenu } from './UserMenu'

interface AppNavProps {
  userEmail: string
}

export function AppNav({ userEmail }: AppNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.05)] bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="group font-serif text-[19px] font-medium uppercase tracking-[0.04em] text-ink-50 transition-all duration-300 ease-trailfilm hover:tracking-[0.07em] hover:opacity-90"
        >
          Trailfilm
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/world"
            title="Memory World Globe"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 font-sans text-[13px] font-medium text-parchment-400 transition-all duration-300 ease-trailfilm hover:border-[rgba(229,166,99,0.4)] hover:bg-[rgba(229,166,99,0.08)] hover:text-amber-accent hover:shadow-[0_0_16px_-4px_rgba(229,166,99,0.2)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            <Globe aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">World</span>
          </Link>
          <Link
            href="/new"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3.5 py-1.5 font-sans text-[13px] font-medium text-parchment-200 transition-all duration-300 ease-trailfilm hover:border-[rgba(229,166,99,0.4)] hover:bg-[rgba(229,166,99,0.08)] hover:text-amber-accent hover:shadow-[0_0_16px_-4px_rgba(229,166,99,0.2)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            New trip
          </Link>
          <UserMenu email={userEmail} />
        </div>
      </div>

      {/* Amber accent hairline — centered gradient at the nav bottom */}
      <div
        aria-hidden
        className="nav-accent-line pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-px w-1/2 opacity-60"
      />
    </header>
  )
}
