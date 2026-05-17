import Link from 'next/link'
import { Plus } from 'lucide-react'

export function AppNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-700 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="font-serif text-[20px] font-medium text-ink-50 tracking-tight"
        >
          Trailfilm
        </Link>
        <Link
          href="/new"
          className="inline-flex items-center gap-1 rounded-md border border-ink-700 px-4 py-2 font-sans text-sm font-medium text-ink-50 min-h-[44px] transition-colors duration-300 ease-trailfilm hover:bg-ink-800 hover:border-parchment-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          New trip
        </Link>
      </div>
    </header>
  )
}
