---
phase: 04-cinematic-viewer
plan: "03"
subsystem: viewer-integration
tags:
  - rsc-extension
  - cinematic-viewer
  - gps-extraction
  - appnav-suppression
  - integration
  - phase4
dependency_graph:
  requires:
    - "src/components/viewer/ChapterSection.tsx (04-01)"
    - "src/components/viewer/ViewerNav.tsx (04-01)"
    - "src/components/viewer/ScrollProgress.tsx (04-01)"
    - "src/components/viewer/ViewerMap.tsx (04-02)"
    - "src/components/viewer/NoGpsState.tsx (04-02)"
    - "src/types/database.ts (StoryChapter, ChapterCoord)"
    - "next/dynamic (ssr:false boundary for mapbox-gl)"
  provides:
    - "src/components/viewer/CinematicViewer.tsx — client wrapper with activeChapterIndex state"
    - "src/app/(app)/trip/[id]/page.tsx — RSC branching on generation_status, server-side GPS extraction"
  affects:
    - "/trip/[id] route — completed trips now render cinematic viewer; draft/generating/failed unchanged"
    - "AppNav visibility — ViewerNav (z-40 fixed) visually replaces AppNav (z-30 sticky) for completed trips"
tech_stack:
  added: []
  patterns:
    - "RSC branch on generation_status === 'completed' — cinematic vs Phase 3 layout"
    - "Server-side GPS extraction: photos.select('id, latitude, longitude').in('id', firstPhotoIds)"
    - "ChapterCoord tuples built server-side — raw GPS never serialized to client (D-06)"
    - "CinematicViewer.tsx 'use client' wrapper holds activeChapterIndex useState + dynamic ViewerMap import"
    - "photoUrlByChapter Record<string,string> built from existing photoRows — no extra DB query"
    - "Approach 1 AppNav suppression: ViewerNav z-40 fixed covers AppNav z-30 sticky"
key_files:
  created:
    - "src/components/viewer/CinematicViewer.tsx"
  modified:
    - "src/app/(app)/trip/[id]/page.tsx"
decisions:
  - "Option A (CinematicViewer client wrapper) chosen for dynamic import boundary — RSC page.tsx stays async server component; all client state lives in CinematicViewer.tsx"
  - "Approach 1 (z-index layering) chosen for AppNav suppression — ViewerNav z-40 fixed always paints above AppNav z-30 sticky; no changes to (app)/layout.tsx; auth/redirect invariant untouched"
  - "photoUrlByChapter built from existing photoRows — avoids a third DB query; storage_path already in photoRows from the photos select(*)"
  - "GPS query only runs when completed && chapters.length > 0 — short-circuits for all other states"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-05-19"
  tasks_completed: 2
  tasks_total: 3
  files_created: 1
  files_modified: 1
---

# Phase 4 Plan 03: RSC Integration + AppNav Suppression Summary

One-liner: `/trip/[id]` RSC extended with server-side GPS extraction (D-06) and completed-trip branch that renders CinematicViewer; AppNav suppressed via z-index layering (Approach 1); `npm run build` passes cleanly.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend /trip/[id] RSC — GPS extraction, chapterCoords, CinematicViewer | 2d72faa | src/app/(app)/trip/[id]/page.tsx, src/components/viewer/CinematicViewer.tsx |
| 2 | AppNav suppression — Approach 1 chosen (z-index layering, no layout changes) | (no file changes — architectural decision) | none |
| 3 | Human end-to-end verification | AWAITING | — |

## AppNav Suppression: Approach 1 Chosen

**Decision:** Approach 1 — ViewerNav `z-40 fixed` visually replaces AppNav `z-30 sticky`. No modifications to `src/app/(app)/layout.tsx`.

**Rationale:**
- ViewerNav is `position: fixed` at `z-40`. AppNav is `position: sticky` at `z-30`. Fixed always paints above sticky in the stacking context — ViewerNav wins the stacking contest at all scroll positions.
- For completed trips, CinematicViewer mounts, which renders ViewerNav — it covers AppNav completely.
- For draft/generating/failed trips, CinematicViewer never mounts, so ViewerNav never renders, and AppNav remains the standard nav — no regression.
- Zero risk to the auth invariant: `(app)/layout.tsx` still runs `supabase.auth.getUser()` and redirects unauthenticated visitors to `/login`.
- Build-verified: `npm run build` exits 0.

## What Was Built

### Task 1: CinematicViewer client wrapper (`src/components/viewer/CinematicViewer.tsx`)

`'use client'` component that acts as the dynamic import boundary for ViewerMap and holds the `activeChapterIndex` state:

- `useState<number | undefined>(undefined)` for `activeChapterIndex`
- `dynamic(() => import('@/components/viewer/ViewerMap'), { ssr: false })` — mapbox-gl cannot be server-rendered
- Renders `<ViewerNav />`, `<ScrollProgress />`, chapter sections stack (with `mr-0 md:mr-[38vw] pb-[40dvh] md:pb-0` offsets for the fixed map panel), and `<ViewerMap chapterCoords={chapterCoords} activeChapterIndex={activeChapterIndex} />`
- Each `<ChapterSection>` receives `onInView={(idx) => setActiveChapterIndex(idx)}` — drives map flyTo on scroll

### Task 1: RSC extension (`src/app/(app)/trip/[id]/page.tsx`)

Extends the existing Phase 3 RSC with:

**Server-side GPS extraction (D-06):**
```typescript
const { data: gpsRows } = await supabase
  .from('photos')
  .select('id, latitude, longitude')
  .in('id', firstPhotoIds)
```
GPS rows consumed only in RSC scope → filtered into `ChapterCoord[]` tuples → passed to CinematicViewer. Raw GPS never serialized to client.

**photoUrlByChapter map:**
Built from existing `photoRows` (no extra DB query) — maps `chapter.id → public URL of chapter.photo_ids[0]`.

**Render branch:**
- `generation_status === 'completed' && chapters.length > 0` → `<CinematicViewer />` (full-bleed, no Phase 3 wrapper)
- All other states → Phase 3 layout unchanged (TripDetailHeader + TripPhotoGrid + DraftStoryCTA / GeneratingStoryState / StorySection)

**Security invariant preserved:** `PhotoForDisplay` shape retains `{ id, publicUrl, taken_at, hasGps }` — no latitude/longitude in client-facing photos array.

## Deviations from Plan

None — plan executed exactly as written. Option A (CinematicViewer wrapper) was used per plan instruction. Approach 1 (z-index layering) was chosen per plan decision rule (Approach 1 preferred unless verification shows bleed-through). Build passed confirming Approach 1 is sound.

## Human Verification Outcome

AWAITING — Task 3 checkpoint not yet reached (this SUMMARY is created at Tasks 1–2 completion, prior to checkpoint).

## Known Stubs

None. CinematicViewer passes real data from the RSC to all child components. `photoUrlByChapter` is derived from actual `photoRows` storage paths. `chapterCoords` is derived from real GPS queries. No hardcoded empty values that would prevent the plan's goal from being achieved.

## Threat Flags

No new network endpoints introduced. The new GPS query (`photos.select('id, latitude, longitude')`) runs server-side inside the RSC and is never serialized to the client — this is the intended security design from D-06. The resulting `ChapterCoord[]` tuples carry no photo IDs, no extra fields, and no personally identifiable location data beyond lat/lng pairs needed for map rendering.

## Self-Check: PASSED

Files verified:
- `src/components/viewer/CinematicViewer.tsx` — FOUND
- `src/app/(app)/trip/[id]/page.tsx` — FOUND (modified)

Commits verified:
- `2d72faa` feat(04-03): wire cinematic viewer into /trip/[id] RSC — FOUND

TypeScript: `npx tsc --noEmit` — 0 errors
Build: `npm run build` — exit 0, no TypeScript errors, no build errors related to viewer components
