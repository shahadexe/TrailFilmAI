---
phase: 04-cinematic-viewer
reviewed: 2026-05-19T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/viewer/ChapterSection.tsx
  - src/components/viewer/ViewerNav.tsx
  - src/components/viewer/ScrollProgress.tsx
  - src/components/viewer/ViewerMap.tsx
  - src/components/viewer/NoGpsState.tsx
  - src/components/viewer/CinematicViewer.tsx
  - src/app/(app)/trip/[id]/page.tsx
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-05-19
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Seven files implementing the cinematic viewer (Mapbox route map, scroll-driven chapter sections, ghost nav, scroll progress bar, RSC trip page extension) were reviewed at standard depth. The implementation is largely well-structured and follows established project patterns. Three blockers were found: a ghost `style.load` listener that is never removed when Effect 2 is cancelled during the async window, a permanently-running `requestAnimationFrame` loop in ViewerNav that fires regardless of scroll activity, and a layout-level `AppNav` that renders unconditionally on top of the cinematic viewer's own `ViewerNav`, producing a double navigation bar. Five warnings cover a cleanup race condition in ViewerMap's Effect 2, an unused dead variable, an inline arrow function causing unnecessary re-renders of every ChapterSection on state change, a `photo_ids` optional-chain mismatch with the declared type, and a missing `aria-live` region for the active-chapter map state. Three info-level items cover minor style inconsistencies.

---

## Critical Issues

### CR-01: `style.load` listener leaked when Effect 2 cleanup runs before the event fires

**File:** `src/components/viewer/ViewerMap.tsx:104`

**Issue:** When Effect 2 (the markers/path effect) fires before the Mapbox style has loaded, it registers a one-time listener via `map.current.once('style.load', addMarkersAndPath)`. The effect's cleanup function (lines 107–118) removes markers and the route layer/source but does **not** call `map.current.off('style.load', addMarkersAndPath)`. If `chapterCoords` changes (causing Effect 2 to re-run) or if the component unmounts before the style finishes loading, the stale `addMarkersAndPath` closure fires anyway. It holds a reference to the old `markers` array (which has already been "cleaned up") and adds a new set of markers that are never tracked in any cleanup scope. This is a memory leak and a visual duplicate-marker bug.

Note: on component unmount, Effect 1's cleanup calls `map.current.remove()` which destroys the map, so the listener fire is benign at unmount. The real risk is a `chapterCoords` prop change while the style is still loading — Effect 2 re-runs, the old pending listener is now orphaned, and `addMarkersAndPath` runs twice for the same map instance, adding duplicate markers that are not tracked in the new `markers` array.

**Fix:**
```typescript
// Effect 2 — markers + path
useEffect(() => {
  if (!map.current || chapterCoords.length === 0) return

  const markers: mapboxgl.Marker[] = []

  const addMarkersAndPath = () => {
    // ... existing implementation ...
  }

  if (map.current.isStyleLoaded()) {
    addMarkersAndPath()
  } else {
    map.current.once('style.load', addMarkersAndPath)
  }

  return () => {
    // Cancel pending listener BEFORE removing markers/layers,
    // so the callback cannot fire after cleanup.
    map.current?.off('style.load', addMarkersAndPath)

    markers.forEach((m) => m.remove())

    if (map.current?.getLayer('route')) map.current.removeLayer('route')
    if (map.current?.getSource('route')) map.current.removeSource('route')
  }
}, [chapterCoords])
```

---

### CR-02: `requestAnimationFrame` loop in ViewerNav runs unconditionally forever

**File:** `src/components/viewer/ViewerNav.tsx:34`

**Issue:** The `update` function schedules itself with `requestAnimationFrame(update)` unconditionally on every frame (line 34), regardless of whether any scroll event occurred. This loop runs at 60 fps continuously for the entire lifetime of the component — reading `window.scrollY`, computing a float, and calling `setNavOpacity` — even when the user is not scrolling and the opacity has not changed. While `setNavOpacity` with the same value should be bailed out by React's state batching, the rAF callback itself, the `window.scrollY` read, and the React reconciler check still fire 60 times per second. This is a correctness issue because `setNavOpacity` **is** called with a new floating-point value on every tick when `y` is in the `80–180px` transition band (linear interpolation produces a unique float each time `prev` drifts due to rounding), causing a new render every frame during normal reading.

Furthermore, `prefersReduced` (line 11) is computed but never used anywhere in the function — the reduced-motion preference has no effect on the nav fade behavior.

**Fix:** Use a passive scroll event listener instead of a polling rAF loop. Only compute and set opacity when scroll actually fires:
```typescript
useEffect(() => {
  let prev = 0

  const update = () => {
    const y = window.scrollY
    const scrollingUp = y < prev
    prev = y

    let opacity: number
    if (scrollingUp && y > 80) {
      opacity = 0.85
    } else if (y <= 80) {
      opacity = 1
    } else if (y >= 180) {
      opacity = 0.08
    } else {
      opacity = 1 - ((y - 80) / 100) * 0.92
    }

    setNavOpacity(opacity)
  }

  window.addEventListener('scroll', update, { passive: true })
  return () => window.removeEventListener('scroll', update)
}, [])
```

---

### CR-03: `AppNav` always renders on top of the cinematic viewer (double navigation bar)

**File:** `src/app/(app)/layout.tsx:15` / `src/components/viewer/CinematicViewer.tsx:32`

**Issue:** `AppLayout` unconditionally renders `<AppNav>` above all children (layout.tsx line 15). When a completed trip renders `<CinematicViewer>`, the page has both `<AppNav>` (sticky, z-30) and `<ViewerNav>` (fixed, z-40) stacked at the top of the viewport. `ViewerNav` visually overlaps `AppNav` due to its higher z-index, but `AppNav` still occupies DOM space in the stacking context and still receives pointer events. This means users scrolling on the left side of the viewport can inadvertently interact with AppNav elements underneath ViewerNav, and the double-nav structure is incorrect for accessibility (two `<header>` landmarks, duplicate navigation landmarks). The PATTERNS.md (line 162) explicitly flags this as a required integration step that was not implemented.

**Fix:** The simplest correct approach is to use `useSelectedLayoutSegment()` or a React context to suppress AppNav from `AppLayout` on the cinematic route. Alternatively, render a `suppressNav` signal via a Next.js parallel slot. A minimal patch is a client wrapper in `AppLayout` that hides AppNav when the pathname matches `/trip/[id]`:

```tsx
// src/app/(app)/layout.tsx
import { AppNavWrapper } from '@/components/layout/AppNavWrapper'

export default async function AppLayout({ children }) {
  // ...auth check...
  return (
    <div className="min-h-screen bg-ink text-ink-50">
      <AppNavWrapper userEmail={user.email ?? ''} />
      <main>{children}</main>
    </div>
  )
}

// src/components/layout/AppNavWrapper.tsx  (new client component)
'use client'
import { usePathname } from 'next/navigation'
import { AppNav } from './AppNav'

export function AppNavWrapper({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  // Suppress AppNav on trip detail pages — ViewerNav renders its own header
  if (/^\/trip\/[^/]+$/.test(pathname)) return null
  return <AppNav userEmail={userEmail} />
}
```

---

## Warnings

### WR-01: Effect 2 cleanup runs while `style.load` callback is executing (partial cleanup race)

**File:** `src/components/viewer/ViewerMap.tsx:107-118`

**Issue:** The cleanup function for Effect 2 runs synchronously on the next render. If React re-renders the component while `addMarkersAndPath` is executing (possible in concurrent mode because marker creation and layer addition are synchronous but the style-load callback is async), the cleanup may call `removeLayer('route')` between the `addSource` and `addLayer` calls, leaving the source without the layer. More concretely: when `chapterCoords.length > 1`, `addMarkersAndPath` calls `addSource('route')` (line 74) followed by `addLayer` (line 86). If cleanup fires between these two lines, `removeLayer` silently no-ops (layer doesn't exist yet), but `removeSource` fails silently or succeeds, leaving the source registered when `addLayer` then tries to bind to it — Mapbox will throw a runtime error "source 'route' already exists" on the next Effect 2 run.

**Fix:** The `off('style.load', addMarkersAndPath)` fix in CR-01 mitigates the primary trigger. Additionally, wrap `addLayer` in a guard:
```typescript
if (map.current.getSource('route')) {
  map.current.addLayer({ ... })
}
```

---

### WR-02: Unused `prefersReduced` variable in ViewerNav

**File:** `src/components/viewer/ViewerNav.tsx:11`

**Issue:** `prefersReduced` is assigned (line 11) but never read. The ghost-nav opacity logic applies identically whether or not `prefers-reduced-motion` is set. The spec (PATTERNS.md §Shared Patterns) states the ViewerNav should still fade when `shouldReduce` is true, but the CSS `transition: opacity 300ms` (line 47) should be replaced with `transition: none` or `duration: 0` for reduced-motion users. The variable is computed but the gate is never applied — the dead assignment is both a code smell and an unfulfilled accessibility requirement.

**Fix:**
```typescript
// Remove the unused variable and honour the preference on the CSS transition:
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Then in JSX:
style={{
  opacity: navOpacity,
  transition: prefersReduced
    ? 'none'
    : 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
}}
```

---

### WR-03: Inline arrow function for `onInView` creates a new function reference every render, causing all ChapterSections to re-render on chapter change

**File:** `src/components/viewer/CinematicViewer.tsx:45`

**Issue:** The `onInView` prop is passed as `(idx) => setActiveChapterIndex(idx)` — a new arrow function created on every render of `CinematicViewer`. When `activeChapterIndex` state changes (which happens on every scroll-triggered chapter transition), `CinematicViewer` re-renders, a new arrow function is created for each `ChapterSection`, and all `ChapterSection` components re-render even though their chapter data has not changed. Each `ChapterSection` registers its own `useScroll`, `useInView`, and `useTransform` hooks. While framer-motion motion values are not recalculated from a prop change, the re-render overhead compounds when there are many chapters.

**Fix:** Stabilize with `useCallback`:
```typescript
import { useState, useCallback } from 'react'

const handleChapterInView = useCallback((idx: number) => {
  setActiveChapterIndex(idx)
}, [])

// In JSX:
<ChapterSection
  key={chapter.id}
  ...
  onInView={handleChapterInView}
/>
```
Or simplify further since `setActiveChapterIndex` is already stable:
```typescript
onInView={setActiveChapterIndex}
```
This requires `ChapterSection`'s `onInView` prop type to accept `number` directly (it currently does: `(chapterIndex: number) => void`), so `setActiveChapterIndex` is directly assignable.

---

### WR-04: `photo_ids` optional-chain is a type lie that masks real errors

**File:** `src/app/(app)/trip/[id]/page.tsx:68,87,109`

**Issue:** `ch.photo_ids?.[0]` uses optional chaining three times, but `StoryChapter.photo_ids` is typed as `string[]` (non-optional, `src/types/database.ts:39`). The optional chain silently returns `undefined` when `photo_ids` is an empty array (which is valid and expected), but also when Supabase returns `null` for the column (a runtime possibility if the DB row is malformed or if a future schema migration makes the column nullable). The real issue is that the optional chain masks a type mismatch: TypeScript believes `photo_ids` is always `string[]`, so `?.[0]` introduces an implicit `undefined` path that TypeScript does not flag, and downstream `.filter(Boolean)` silently drops chapters that should have triggered a data integrity warning.

**Fix:** Be explicit about the intent. If `photo_ids` can realistically be null at runtime (Supabase JSON columns can return null for missing data), update the type:
```typescript
// In src/types/database.ts:
photo_ids: string[] | null
```
Then the optional chain is accurate and TypeScript will correctly flag any unguarded access elsewhere. If it truly can never be null, replace `ch.photo_ids?.[0]` with `ch.photo_ids[0]` and add a runtime invariant check.

---

### WR-05: No `aria-live` region for map state changes — screen readers get no feedback on chapter transitions

**File:** `src/components/viewer/ViewerMap.tsx:136-157`

**Issue:** When `activeChapterIndex` changes and `flyTo` is called, the map silently repositions. Screen reader users navigating through the story get no announcement that the map has moved to a new location. The `role="region"` container has a static `aria-label="Trip route map"` but no live region. Keyboard users (the map is `tabIndex={0}`) also have no way to know what location the current chapter corresponds to.

**Fix:** Add a visually-hidden `aria-live="polite"` region inside the map container that announces the current chapter location when `activeChapterIndex` changes:
```tsx
// In ViewerMap, add state for announcement:
const [announcement, setAnnouncement] = useState('')

// In Effect 3, after flyTo:
const label = coord.label ?? `Chapter ${activeChapterIndex + 1}`
setAnnouncement(`Map moved to ${label}`)

// In JSX, inside the map container div:
<span
  className="sr-only"
  aria-live="polite"
  aria-atomic="true"
>
  {announcement}
</span>
```

---

## Info

### IN-01: `NoGpsState` uses `aria-hidden="false"` which is redundant and potentially confusing

**File:** `src/components/viewer/NoGpsState.tsx:8`

**Issue:** `aria-hidden="false"` is the default for all DOM elements — setting it explicitly is a no-op but signals to future developers that some deliberate accessibility decision was made here. It also conflicts with `pointer-events-none` on the same element: if the element is interactive to AT (aria-hidden=false), `pointer-events-none` creates a divergence between pointer and AT reachability. Since this is a purely informational state display, the div should either omit `aria-hidden` entirely or carry an explicit role.

**Fix:** Remove `aria-hidden="false"` from the outer div. The `<p>` content is readable to AT by default. If the text should be grouped semantically, add `role="status"`:
```tsx
<div
  role="status"
  className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
>
```

---

### IN-02: `paragraphItem` variant object defined inside the component body on every render

**File:** `src/components/viewer/ChapterSection.tsx:64-74`

**Issue:** `paragraphItem` is defined inside the component function body (line 64), which means it is recreated as a new object on every render. It depends only on `shouldReduce`, which changes at most once per session. `paragraphContainer` is correctly hoisted outside the component (line 21) but `paragraphItem` was not, likely because it uses `shouldReduce`. This is a minor allocation on every render but it also means Framer Motion receives a new object reference each time and must re-diff the variants.

**Fix:** Either hoist with a factory function or memoize:
```typescript
const paragraphItem = useMemo(() => ({
  hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: shouldReduce ? 0 : 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
}), [shouldReduce])
```

---

### IN-03: `chapterCoords[0]?.lng` initial map center uses `0,0` fallback (Gulf of Guinea) when no GPS data exists

**File:** `src/components/viewer/ViewerMap.tsx:33`

**Issue:** When `chapterCoords` is an empty array (no GPS data for any chapter), the Mapbox map is initialized centered on `[0, 0]` — the intersection of the Prime Meridian and the Equator, in the Gulf of Guinea off West Africa. This is visually confusing before `<NoGpsState>` is shown (the map briefly renders the Atlantic Ocean). The `NoGpsState` overlay is only applied at line 154 when `chapterCoords.length === 0`, but the map itself has already been initialized and painted.

**Fix:** Guard the map initialization against the no-GPS case, or use a more neutral default:
```typescript
// Option A: skip map init if no coords
if (!mapContainer.current || map.current || chapterCoords.length === 0) return

// Option B: use a more intentional fallback center (e.g. center of populated world)
center: chapterCoords.length > 0
  ? [chapterCoords[0].lng, chapterCoords[0].lat]
  : [10, 20], // rough center of inhabited land masses
zoom: chapterCoords.length > 0 ? 8 : 1,
```

---

_Reviewed: 2026-05-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
