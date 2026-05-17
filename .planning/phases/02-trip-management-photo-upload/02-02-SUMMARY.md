---
phase: 02-trip-management-photo-upload
plan: "02"
subsystem: dashboard
status: complete
tags:
  - dashboard
  - trip-card
  - empty-state
  - framer-motion
  - server-component
  - shadcn-skeleton
dependency_graph:
  requires:
    - 02-01 (shadcn skeleton component)
    - 01-02 (Supabase clients + database types)
    - 01-03 (app layout auth guard)
  provides:
    - TRIP-02: /dashboard RSC with trip grid + empty state
    - AppNav server component for all (app) routes
    - TripCard / TripCardGrid / TripCardSkeleton / EmptyState component set
  affects:
    - 02-03 (wizard at /new — target of empty state CTA and AppNav 'New trip')
    - 02-05 (trip detail at /trip/[id] — target of TripCard Link)
    - 02-06 (delete dialog — data-trip-options-trigger seam on TripCard)
tech_stack:
  added:
    - "next/image with Supabase Storage remote pattern (**.supabase.co added to next.config.mjs)"
  patterns:
    - "RSC data fetch with FK join: .select('*, cover:photos!cover_photo_id(id, storage_path)')"
    - "Server-side cover URL derivation: supabase.storage.from('trip-photos').getPublicUrl(storage_path)"
    - "Framer Motion stagger grid: containerVariants with staggerChildren/delayChildren + cardVariants"
    - "useReducedMotion() gating: initial={false} skips entrance; duration:0 collapses hover transition"
key_files:
  created:
    - src/components/trip/TripCard.tsx
    - src/components/trip/TripCardGrid.tsx
    - src/components/trip/TripCardSkeleton.tsx
    - src/components/trip/EmptyState.tsx
    - src/components/layout/AppNav.tsx
  modified:
    - src/app/(app)/dashboard/page.tsx
    - src/app/(app)/layout.tsx
    - next.config.mjs
decisions:
  - "Cover URL computed server-side in dashboard RSC (not in TripCard client component) to keep storage.getPublicUrl out of 'use client' boundary"
  - "TripCard receives coverUrl: string | null as a prop — keeps the client component free of Supabase dependencies"
  - "Three-dot menu button ships with data-trip-options-trigger attribute as seam for Plan 06 delete dialog wiring"
  - "AppNav is a server component (no 'use client') — it has no interactivity beyond Next.js Links"
  - "next.config.mjs updated (not next.config.js — project uses ESM config)"
metrics:
  duration: "~35 minutes"
  completed_date: "2026-05-18"
  tasks_completed: 4
  tasks_total: 4
  files_changed: 8
---

# Phase 2 Plan 02: Dashboard Surface Summary

**One-liner:** Trip dashboard RSC with cover-photo FK join, Framer Motion stagger grid, inline-SVG empty state, and AppNav — all gated by useReducedMotion.

## What Was Built

### Component Inventory

**`src/components/trip/TripCard.tsx`** (`'use client'`)
- Props: `{ trip: Trip; coverUrl: string | null }`
- `motion.div` outer with `whileHover={{ y: -4, borderColor: 'rgba(229, 166, 99, 0.30)' }}`, `transition.duration` collapses to 0 when `useReducedMotion()` is true
- Cover zone: `aspect-video w-full bg-ink-700` — renders `next/image` (fill, object-cover) when `coverUrl` is non-null; Lucide `ImageOff` (h-6 w-6 parchment-400) centered when null
- Body: `px-4 py-3` — `h3` with `font-serif font-medium text-lg md:text-xl line-clamp-2`; `p` with `font-sans text-sm text-parchment-400 line-clamp-1` rendered only when `trip.destination` is truthy
- Entire card wrapped in `<Link href={`/trip/${trip.id}`}>` with `aria-label={trip.title}`
- Three-dot button: `absolute top-2 right-2`, `aria-label="Trip options"`, `data-trip-options-trigger`, `opacity-0 group-hover:opacity-100` — no `onClick` in Plan 02

**`src/components/trip/TripCardSkeleton.tsx`** (server-compatible)
- Three shadcn `<Skeleton>` blocks with `bg-ink-700` brand override: `aspect-video w-full` cover + `h-4 w-3/4` title + `h-3 w-1/2` destination
- Matches TripCard dimensions exactly for seamless Suspense fallback swap

**`src/components/trip/TripCardGrid.tsx`** (`'use client'`)
- Props: `{ trips: { trip: Trip; coverUrl: string | null }[] }`
- Framer Motion stagger container: `staggerChildren: 0.15`, `delayChildren: 0.1`, `viewport={{ once: true, amount: 0.2 }}`
- Each card wrapped in `motion.div` with `cardVariants` (`hidden: { opacity: 0, y: 16 }` → `visible: { opacity: 1, y: 0, duration: 0.6 }`)
- `initial={shouldReduce ? false : 'hidden'}` — reduced motion users see cards immediately in final state
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

**`src/components/trip/EmptyState.tsx`** (`'use client'`)
- Inline SVG (160×120 viewBox 0 0 160 120, `aria-hidden="true"`):
  - Polaroid border rect (rotated -3deg, parchment-600 at opacity 0.2)
  - Film frame rect (stroke #1F1F1F, 2px) with 8 sprocket circles (4 each side, cy={32,48,64,80})
  - Map pin `motion.g` at cx=80 cy=60: `animate={{ scale: [1, 1.08, 1] }}`, `repeat: Infinity, duration: 2, ease: 'easeInOut'` — gated by `useReducedMotion()`
- Headline: `font-serif font-medium text-2xl md:text-[28px]` — "Your first chapter awaits."
- Subline: `font-sans text-base text-parchment-400` — "Upload photos. We'll write the story." (apostrophe encoded `&apos;`)
- CTA: `<Link href="/new">` with `bg-amber-accent min-h-[44px]` — "Create your first trip"

**`src/components/layout/AppNav.tsx`** (server component)
- `sticky top-0 z-20 border-b border-ink-700 bg-ink/95 backdrop-blur`
- Left: `<Link href="/dashboard">` — Trailfilm wordmark, `font-serif text-[20px] font-medium`
- Right: `<Link href="/new">` ghost button — `border border-ink-700 min-h-[44px]`, Lucide `Plus` h-4 w-4, "New trip" label

### Dashboard Page

**`src/app/(app)/dashboard/page.tsx`** (async RSC, no `'use client'`)
```typescript
// Query with FK join
const { data: rows } = await supabase
  .from('trips')
  .select('*, cover:photos!cover_photo_id(id, storage_path)')
  .eq('user_id', user!.id)
  .order('created_at', { ascending: false })

// Server-side cover URL derivation
const coverUrl = row.cover
  ? supabase.storage.from('trip-photos').getPublicUrl(row.cover.storage_path).data.publicUrl
  : null
```
- Renders `<TripCardGrid trips={trips} />` when `trips.length > 0`, otherwise `<EmptyState />`
- Page title `h1`: "Your archive." — `font-serif text-[28px] md:text-[40px] font-medium`

**`src/app/(app)/layout.tsx`** — Phase 1 auth guard preserved (`createClient + getUser + redirect('/login')`); `<AppNav />` mounted above `<main>{children}</main>`

**`next.config.mjs`** — Added `images.remotePatterns` entry: `{ protocol: 'https', hostname: '**.supabase.co' }` to permit Supabase Storage URLs in `next/image`

## Plan 06 Seam

TripCard ships the three-dot button with `data-trip-options-trigger` attribute and no `onClick`. Plan 06 will query this attribute to attach the shadcn Dialog delete confirmation without re-rendering the card component.

## Deviations from Plan

**1. [Rule 3 - Config] Used next.config.mjs instead of next.config.js**
- **Found during:** Task 1
- **Issue:** The project uses ESM config (`next.config.mjs`), not CommonJS (`next.config.js`) as the plan mentioned
- **Fix:** Updated `next.config.mjs` with the `images.remotePatterns` entry instead of creating a new file
- **Files modified:** `next.config.mjs`
- **Commit:** e6c7243

**2. [Rule 1 - Bug] Renamed `cover` destructure variable to `_cover`**
- **Found during:** Task 3
- **Issue:** Destructuring `const { cover, ...trip } = row` would trigger an unused variable lint warning since `cover` is only used on the previous line
- **Fix:** Used `const { cover: _cover, ...trip } = row` to satisfy the linter convention for intentional unused destructure
- **Files modified:** `src/app/(app)/dashboard/page.tsx`
- **Commit:** 2a87c8c

## Known Stubs

None — all data flows are wired (trips fetch from DB, cover URLs from Supabase Storage, EmptyState/TripCardGrid conditionally rendered).

## Threat Flags

No new threat surface beyond what the plan's threat model covers. RLS + explicit `.eq('user_id', user.id)` defense-in-depth is in place. No `dangerouslySetInnerHTML` used anywhere. Cover photo storage URLs are public-bucket by design (T-02-07 accepted).

## Human Verification (Task 4)

**Status:** Approved by user on 2026-05-18.

Verified behaviors:
- /dashboard renders "Your archive." headline
- Empty state (zero trips): inline SVG illustration, "Your first chapter awaits." headline, "Upload photos. We'll write the story." subline, amber "Create your first trip" CTA linking to /new — all correct
- Populated state: TripCard renders with cover photo (or ImageOff fallback), Fraunces title, Inter destination text
- Hover animation: card lifts y: -4, border shifts to amber rgba(229,166,99,0.30), three-dot MoreVertical button appears top-right at opacity 1
- AppNav: "Trailfilm" wordmark left, "New trip" ghost link right — present and functional
- Responsive grid: 1-column mobile, 2-column sm, 3-column lg
- Stagger entrance: cards fade up in sequence (staggerChildren 0.15s)
- Reduced motion: no entrance animation, no pin pulse when OS reduced-motion is enabled

## Self-Check: PASSED

Files verified to exist:
- src/components/trip/TripCard.tsx — FOUND
- src/components/trip/TripCardGrid.tsx — FOUND
- src/components/trip/TripCardSkeleton.tsx — FOUND
- src/components/trip/EmptyState.tsx — FOUND
- src/components/layout/AppNav.tsx — FOUND
- src/app/(app)/dashboard/page.tsx — FOUND (rewritten)
- src/app/(app)/layout.tsx — FOUND (updated)
- next.config.mjs — FOUND (updated)

Commits verified:
- e6c7243 — Task 1: TripCard + TripCardSkeleton + next.config.mjs
- 0423bb1 — Task 2: TripCardGrid + EmptyState
- 2a87c8c — Task 3: Dashboard RSC + AppNav + layout update
- Task 4: Human verification approved (no code changes — checkpoint gate)
