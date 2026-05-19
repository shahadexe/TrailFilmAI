---
phase: 04-cinematic-viewer
plan: "01"
subsystem: viewer-chrome
tags:
  - framer-motion
  - scroll-parallax
  - viewer-components
  - phase4
dependency_graph:
  requires:
    - "src/types/database.ts (StoryChapter interface)"
    - "framer-motion (useScroll, useTransform, useReducedMotion, motion)"
    - "next/image (fill+object-cover pattern)"
    - "lucide-react (ChevronLeft)"
    - "src/app/globals.css (.gradient-fade-bottom, .gradient-fade-top, .ambient-glow, .nav-accent-line)"
  provides:
    - "src/components/viewer/ChapterSection.tsx — full-screen parallax chapter section"
    - "src/components/viewer/ViewerNav.tsx — ghost floating nav with scroll-fade"
    - "src/components/viewer/ScrollProgress.tsx — fixed amber left-edge scroll indicator"
  affects:
    - "Plan 04-02 (ViewerMap) — imports ChapterSection.onInView callback contract"
    - "Plan 04-03 (RSC wiring) — mounts all three components at page root"
tech_stack:
  added: []
  patterns:
    - "useScroll({ target: sectionRef, offset: ['start end', 'end start'] }) — per-chapter scroll tracking"
    - "useTransform spec-locked ranges from Build Guide §10.5"
    - "rAF-based scroll listener for ViewerNav opacity (window.scrollY, no Framer useScroll in nav)"
    - "useReducedMotion gate on all scroll-linked animation values"
    - "Option A Framer Motion scaleY for ScrollProgress (preferred per UI-SPEC)"
key_files:
  created:
    - "src/components/viewer/ChapterSection.tsx"
    - "src/components/viewer/ViewerNav.tsx"
    - "src/components/viewer/ScrollProgress.tsx"
  modified: []
decisions:
  - "paragraphItem ease typed as [number,number,number,number] tuple to satisfy Framer Motion Variants typing"
  - "paragraphItem variant defined inside component (not outside) to capture shouldReduce closure — consistent with plan action"
  - "useInView called twice in ChapterSection: once:true for reduced-motion paragraph reveal, once:false amount:0.3 for map flyTo callback"
metrics:
  duration: "~14 minutes"
  completed_date: "2026-05-19"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 0
---

# Phase 4 Plan 01: Viewer Chrome Components Summary

Three `'use client'` viewer chrome components created — parallax chapter section, ghost floating nav with scroll-fade, and amber scroll-progress indicator — implementing the exact Motion Contract from `04-UI-SPEC.md` with no spec deviations.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ChapterSection — full-screen parallax section with scroll-linked text fade | 4b892a5, 921046c | src/components/viewer/ChapterSection.tsx |
| 2 | ViewerNav — ghost floating nav with scroll-fade and Back-to-dashboard link | 5dd37a7 | src/components/viewer/ViewerNav.tsx |
| 3 | ScrollProgress — fixed left-edge amber hairline driven by page scroll | 6c8b9b3 | src/components/viewer/ScrollProgress.tsx |

## Key Motion Constants Implemented

**ChapterSection (spec-locked, Build Guide §10.5):**
- `parallaxY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])` — photo backdrop parallax with scale-110 edge-reveal prevention
- `textOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])` — text fade-in and fade-out
- `textY = useTransform(scrollYProgress, [0.1, 0.3], [40, 0])` — text rise entrance
- Paragraph stagger: `staggerChildren: 0.08, delayChildren: 0.05`, each `<p>` at duration 0.7, ease `[0.22, 1, 0.36, 1]`
- `useScroll({ target: sectionRef, offset: ['start end', 'end start'] })` — per-chapter progress tracking

**ViewerNav scroll-fade thresholds:**
- `scrollY <= 80px`: opacity 1.0 (full chrome while near top)
- `scrollY 80–180px`: linear remap 1.0 → 0.08 (`1 - ((y - 80) / 100) * 0.92`)
- `scrollY >= 180px`: opacity 0.08 (ghost — near-invisible but accessible)
- Scroll-up reversal: opacity 0.85 (NOT 1.0 — preserves ghost quality)
- CSS: `transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)`

**ScrollProgress:**
- `scaleY: scrollYProgress` on `motion.div` with `transformOrigin: 'top'` and `h-screen` container
- Background: `#E5A663` (literal hex per UI-SPEC — no Tailwind class)
- Reduced motion: static bar at `opacity: 0.15`

## Pattern Carry-forwards

- **Eyebrow format**: `CHAPTER ${String(chapterIndex + 1).padStart(2, '00')}` — exact StoryChapterBlock convention from Phase 3
- **useReducedMotion gate**: pattern from StoryChapterBlock line 15 applied to all three components
- **Image fill + object-cover**: pattern from TripCard applied to ChapterSection photo backdrop with `sizes="100vw"` and `priority={chapterIndex === 0}`
- **nav-accent-line**: amber hairline carried forward from AppNav into ViewerNav
- **Focus ring**: `focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink` on ViewerNav back button
- **Brand easing**: `[0.22, 1, 0.36, 1]` on all Framer Motion transitions

## Color Tokens (exact, per UI-SPEC §Color)

- `bg-ink` (#0A0A0A) — section canvas fallback
- `text-parchment` (#FAFAF7) — chapter title
- `text-parchment-200` (#E8E6DF) — chapter narrative prose
- `text-parchment-600` (#6B6862) — chapter eyebrow
- `#E5A663` (amber-accent) — ScrollProgress fill only (amber budget: progress bar + nav hairline = 2 of 4 reserved elements)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in paragraphItem ease array**
- **Found during:** TypeScript check after Task 1 (ran `tsc --noEmit` from main project with files temporarily copied)
- **Issue:** `ease: [0.22, 1, 0.36, 1]` was inferred as `number[]`, which is not assignable to Framer Motion's `Variants` type (requires `EasingFunction` which accepts tuple `[number, number, number, number]`)
- **Fix:** Added `as [number, number, number, number]` type assertion on the ease array in `paragraphItem.visible.transition`
- **Files modified:** `src/components/viewer/ChapterSection.tsx`
- **Commit:** 921046c

## Known Stubs

None. All three components are fully implemented with no placeholder values, hardcoded empty data, or TODO markers. Plans 04-02 and 04-03 can import and mount them directly.

## Threat Flags

None. These are pure client-side rendering components. No network endpoints, no auth paths, no file access, and no schema changes introduced. The `onInView` callback in ChapterSection is a prop — its security surface belongs to the caller (Plan 04-03 RSC wiring).

## Self-Check: PASSED

Files verified:
- `src/components/viewer/ChapterSection.tsx` — FOUND
- `src/components/viewer/ViewerNav.tsx` — FOUND
- `src/components/viewer/ScrollProgress.tsx` — FOUND

Commits verified:
- `4b892a5` feat(04-01): create ChapterSection parallax viewport component — FOUND
- `921046c` fix(04-01): type paragraphItem ease array as [number,number,number,number] tuple — FOUND
- `5dd37a7` feat(04-01): create ViewerNav ghost floating nav with scroll-fade — FOUND
- `6c8b9b3` feat(04-01): create ScrollProgress fixed amber scroll-indicator hairline — FOUND

TypeScript: `npx tsc --noEmit` produced 0 errors for all three files (verified by copying to main project with full dependency context and running tsc).
