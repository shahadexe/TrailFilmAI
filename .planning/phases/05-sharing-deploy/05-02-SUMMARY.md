---
phase: 05-sharing-deploy
plan: "02"
subsystem: public-viewer
tags: [public-route, cinematic-viewer, og-meta, watermark, cta, middleware]
dependency_graph:
  requires: [05-01]
  provides: [public-viewer-route, trailfilm-watermark, archive-cta, og-meta-tags]
  affects: [src/components/viewer/CinematicViewer.tsx, src/lib/supabase/middleware.ts]
tech_stack:
  added: []
  patterns:
    - Next.js App Router (public) route group with own root layout
    - generateMetadata() for dynamic OG tags from Supabase RSC
    - useInView + useReducedMotion Framer Motion scroll entrance
    - showNav prop pattern for conditional ViewerNav render
key_files:
  created:
    - src/app/(public)/layout.tsx
    - src/app/(public)/t/[id]/page.tsx
    - src/components/viewer/TrailfilmWatermark.tsx
    - src/components/viewer/ArchiveCTA.tsx
  modified:
    - src/components/viewer/CinematicViewer.tsx
    - src/lib/supabase/middleware.ts
decisions:
  - D-01: (public) route group outside (app) — no auth guard inherited
  - D-02: CinematicViewer reused via showNav={false} prop to suppress ViewerNav
  - D-03: redirect('/login?message=private') for private/nonexistent trips — avoids leaking trip existence
  - D-09: raw Supabase Storage URL for og:image — no Satori for MVP
metrics:
  duration: "~25 minutes"
  completed: "2026-05-19"
  tasks_completed: 2
  files_changed: 6
---

# Phase 05 Plan 02: Public Viewer Route Group Summary

Public viewer at `/t/[id]` is live — any unauthenticated visitor can experience the full cinematic viewer for a public trip, with a "Made with Trailfilm" watermark, "Create your own archive →" CTA, and full OG meta tags for social sharing.

## Tasks Completed

### Task 1: Extend CinematicViewer + Create TrailfilmWatermark and ArchiveCTA

**CinematicViewer.tsx** — Added optional `showNav?: boolean` prop to `CinematicViewerProps`. Changed unconditional `<ViewerNav />` render to `{showNav !== false && <ViewerNav />}`. Default behavior is unchanged (ViewerNav renders when prop is absent). No other changes to the component.

**TrailfilmWatermark.tsx** — New `'use client'` component. Fixed `bottom-5 right-5 z-50`. Uses `motion.div` with `whileTap={{ scale: 0.97 }}` gated on `useReducedMotion()`. Link to `/` with `aria-label="Made with Trailfilm — create your own travel archive"`. Idle: `text-parchment-200 opacity-50`. Hover: `hover:text-amber-accent hover:opacity-100`. Transition: explicit `color` and `opacity` with `cubic-bezier(0.22, 1, 0.36, 1)` easing. No Lucide icon — pure typographic signature. `letterSpacing: '0.04em'` via inline style.

**ArchiveCTA.tsx** — New `'use client'` component. `useRef` on section, `useInView({ once: true, margin: '-80px' })`, `useReducedMotion()`. Section has `min-h-dvh flex flex-col items-center justify-center bg-ink px-4 py-12`. Inner `motion.div` with `opacity 0→1, y: 24→0` entrance (800ms, brand easing), instantly revealed when reduced motion is true. Single Link to `/signup` with `aria-label="Create your own travel archive on Trailfilm"`. Text: "Create your own archive →" (U+2192 via `&#x2192;`). Idle: `text-parchment-400 font-serif text-base font-normal`. Hover: `text-amber-accent underline decoration-amber-accent underline-offset-4`.

### Task 2: (public) Route Group — Layout, Public Viewer RSC, generateMetadata, Middleware Comment

**src/app/(public)/layout.tsx** — New root layout for the `(public)` route group. Imports `Fraunces` and `Inter` from `next/font/google` with identical config to root layout (subsets `['latin']`, display `'swap'`, weights `['400','500','600']`). Imports `../globals.css`. `<body>` receives `${fraunces.variable} ${inter.variable} bg-ink text-ink-50 font-sans antialiased`. No auth guard. No AppNavWrapper.

**src/app/(public)/t/[id]/page.tsx** — New RSC with two exports:

- `generateMetadata({ params })`: Fetches trip (title, is_public). Returns `{ title: 'Trailfilm' }` for private/nonexistent trips (T-05-05 mitigation). Fetches first chapter by `.order('chapter_index', { ascending: true })` (NOT order_index) and first photo by `order_index ASC`. Builds description with 150-char word-boundary truncation. Returns full `openGraph` + `twitter` metadata objects with `og:title`, `og:description`, `og:image` (1200×630).
- `PublicViewerPage({ params })`: Fetches trip with no ownership filter. Redirects to `/login?message=private` if `!trip || !trip.is_public` (T-05-03 mitigation). Fetches photos by `order_index ASC`, chapters by `chapter_index ASC`. Extracts `chapterCoords` and `photoUrlByChapter` using identical GPS extraction logic as authenticated viewer (no ownership filter). Returns `<main className="relative bg-ink"><TrailfilmWatermark /><CinematicViewer ... showNav={false} /><ArchiveCTA /></main>`.

**src/lib/supabase/middleware.ts** — Added one comment line immediately above `const isProtected =`: `// /t/* (public viewer) is intentionally absent — unauthenticated access is required. Keep in sync with src/app/(public)/ route group.` No logic changes.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data flows are wired directly to Supabase.

## Threat Flags

No new threat surface beyond what is documented in the plan's `<threat_model>`. All T-05-03 and T-05-05 mitigations are implemented as specified.

## Self-Check

- [x] `src/app/(public)/layout.tsx` — contains `--font-fraunces`, `--font-inter`, `bg-ink text-ink-50 font-sans antialiased`, `<html lang="en">` root
- [x] `src/app/(public)/t/[id]/page.tsx` — exports `generateMetadata` and default `PublicViewerPage`, contains `redirect('/login?message=private')`, `.order('chapter_index', ...)`, `showNav={false}`, imports `TrailfilmWatermark` and `ArchiveCTA`
- [x] `src/components/viewer/CinematicViewer.tsx` — contains `showNav?: boolean` in interface, `{showNav !== false && <ViewerNav />}` guard
- [x] `src/components/viewer/TrailfilmWatermark.tsx` — contains `fixed bottom-5 right-5 z-50`, `useReducedMotion`, `aria-label="Made with Trailfilm — create your own travel archive"`
- [x] `src/components/viewer/ArchiveCTA.tsx` — contains `href="/signup"`, `useInView`, `useReducedMotion`, `min-h-dvh`
- [x] `src/lib/supabase/middleware.ts` — contains the `/t/*` comment; `isProtected` logic unchanged

## Self-Check: PASSED
