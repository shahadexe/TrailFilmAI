import Link from 'next/link'

export default function MarketingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-serif text-[36px] font-medium uppercase tracking-[0.06em] text-ink-50 md:text-[56px]">
          Trailfilm
        </h1>
        <Link
          href="/login"
          className="font-sans text-base font-medium text-[#B5B2A8] transition-colors duration-300 ease-trailfilm hover:underline hover:text-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Sign in →
        </Link>
      </div>
    </main>
  )
}
