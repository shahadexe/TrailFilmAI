---
phase: 04-cinematic-viewer
plan: "02"
subsystem: viewer-map
tags: [mapbox, viewer, map, component, no-gps]
dependency_graph:
  requires:
    - mapbox-gl@3.23.1 (installed)
    - lucide-react MapPin
  provides:
    - src/components/viewer/ViewerMap.tsx — Mapbox GL client component (default + named export)
    - src/components/viewer/NoGpsState.tsx — no-GPS empty state fallback
  affects:
    - Plan 04-03 (imports ViewerMap via dynamic() and NoGpsState, passes chapterCoords + activeChapterIndex)
tech_stack:
  added: []
  patterns:
    - Mapbox GL JS v3.23.1 — first use in codebase; dark-v11 style; useEffect split for init vs markers/path vs flyTo
    - mapboxgl.accessToken assigned at module top-level (outside component function)
    - Dynamic import candidate — 'use client'; ssr: false in Plan 04-03 dynamic() call
    - Responsive fixed positioning via Tailwind responsive prefix overrides (mobile base → md: desktop)
    - NoGpsState: pointer-events-none overlay so map canvas remains interactive beneath
key_files:
  created:
    - src/components/viewer/ViewerMap.tsx
    - src/components/viewer/NoGpsState.tsx
  modified: []
decisions:
  - D-05 dashed amber path: line-dasharray [2,2] — archival/editorial map trace, not GPS track
  - D-08 no-GPS fallback: map mounts (dark-v11 background visible), NoGpsState floats over canvas
  - flyTo essential:true — spatial navigation, NOT gated on useReducedMotion per UI-SPEC Reduced Motion table
  - Single responsive container: one wrapper div with mobile base classes + md: overrides (no dual-instance problem)
  - Marker pulse animation deferred — static 8px amber dot implemented; pulse is optional UI-SPEC polish
metrics:
  duration: "~25 minutes"
  completed: "2026-05-19T10:37:12Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 4 Plan 02: ViewerMap + NoGpsState Summary

**One-liner:** Mapbox GL dark-v11 map with dashed amber path (line-dasharray [2,2]), 8px amber dot markers, per-chapter flyTo (essential:true, 1500ms), responsive fixed sidebar/bottom-sheet, and silent NoGpsState overlay.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | NoGpsState — static empty-state for map panel | 846030c | src/components/viewer/NoGpsState.tsx |
| 2 | ViewerMap — Mapbox GL client with dashed amber path, markers, flyTo | 8aad769 | src/components/viewer/ViewerMap.tsx |

## What Was Built

### Task 1: NoGpsState (`src/components/viewer/NoGpsState.tsx`)

Static `'use client'` component — no props, no animation.

- Container: `absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none`
- Lucide MapPin icon: `h-5 w-5 text-parchment-600 opacity-50 strokeWidth={1.5}`
- Message: `"No location data"` — `font-sans text-[13px] text-parchment-600 text-center opacity-50`
- `pointer-events-none` keeps the Mapbox canvas interactive beneath it (map still pan/zoomable when no GPS)
- `aria-hidden="false"` on container (message is visible text for assistive tech); `aria-hidden="true"` on icon (decorative)

Matches UI-SPEC Copywriting Contract exactly: "No location data" — no period, no apology, factual.

### Task 2: ViewerMap (`src/components/viewer/ViewerMap.tsx`)

Full Mapbox GL client component.

**Initialization (Effect 1 — `[]` deps):**
- `mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!` — assigned at module top-level
- `mapboxgl.Map` with `style: 'mapbox://styles/mapbox/dark-v11'`, `zoom: 8`, `interactive: true`
- Cleanup: `map.current?.remove(); map.current = null`

**Markers + path (Effect 2 — `[chapterCoords]` deps):**
- Guard: `if (!map.current || chapterCoords.length === 0) return`
- Style-load check: uses `map.current.isStyleLoaded()` — calls directly or listens for `style.load`
- Amber dot markers: `width:8px;height:8px;border-radius:50%;background:#E5A663;`
- Dashed amber path (when 2+ coords): `line-color #E5A663`, `line-width 2`, `line-opacity 0.8`, `line-dasharray [2,2]`, `line-join round`, `line-cap round`
- Cleanup removes all markers and route layer/source for clean re-add on chapterCoords change

**flyTo (Effect 3 — `[activeChapterIndex, chapterCoords]` deps):**
- Finds coord by `c.chapterIndex === activeChapterIndex`
- `flyTo({ center, zoom: 10, duration: 1500, essential: true })`
- NOT gated on `useReducedMotion` — spatial navigation per UI-SPEC Reduced Motion table

**Responsive layout (single container):**
- Mobile base: `fixed bottom-0 left-0 right-0 h-[40dvh] z-20 border-t border-[rgba(255,255,255,0.06)] bg-ink/90 backdrop-blur-xl`
- Desktop md+: `md:top-0 md:left-auto md:right-0 md:bottom-auto md:h-[100dvh] md:w-[38vw] md:border-t-0 md:border-l md:border-[rgba(255,255,255,0.06)] md:bg-ink md:backdrop-blur-none`
- One Mapbox instance; one `<div ref={mapContainer} className="absolute inset-0" />`
- `role="region" aria-label="Trip route map" tabIndex={0}`
- Renders `<NoGpsState />` when `chapterCoords.length === 0` (D-08)

**Exports:**
- `export interface ChapterCoord` — named export for Plan 04-03 RSC to re-export/use
- `export function ViewerMap` — named export
- `export default ViewerMap` — default export (resolves `dynamic(() => import(...))` in Plan 04-03)

## Deviations from Plan

None — plan executed exactly as written.

The PATTERNS.md container JSX skeleton (joined classes on one element) was noted as logically broken for dual fixed-position layouts; the plan task action's single-wrapper responsive approach was followed instead. This is the intended override (plan task action takes precedence over PATTERNS.md skeleton per plan note).

## Deferred Items

- **Active marker pulse animation** (CSS scale 1→1.3→1, 800ms on active marker): deferred per UI-SPEC allowance ("subtle polish — static 8px amber dot is the primary functional spec"). The pulse would require tracking which marker corresponds to `activeChapterIndex`, applying a CSS class, and gating on `useReducedMotion`. Scope deferred to post-MVP.
- **Path draw animation** (line-dasharray offset trick for "path being traced" effect): omitted for scope control. The dashed path appears fully drawn at map load. UI-SPEC notes this as polish rather than a functional requirement.

## Mapbox Version

`mapbox-gl` v3.23.1 — confirmed in `package.json`. `@types/mapbox-gl` v3.5.0.

## Token Verification

`NEXT_PUBLIC_MAPBOX_TOKEN` confirmed present in `.env.local` (pk.eyJ1... token).

## Known Stubs

None. Both components are complete and production-ready within their scope. NoGpsState has no data dependency. ViewerMap accepts props that Plan 04-03 will wire.

## Threat Flags

No new network endpoints, auth paths, or trust boundaries introduced. Mapbox GL loads tiles client-side using a public token (NEXT_PUBLIC_*) — this is expected behavior for a public-facing map SDK. Token is already scoped to Mapbox's domain restriction system (documented in Build Guide §14.3 for Vercel deploy, out of Phase 4 scope).

## Self-Check

- [x] `src/components/viewer/NoGpsState.tsx` exists in worktree
- [x] `src/components/viewer/ViewerMap.tsx` exists in worktree
- [x] Commit 846030c exists (NoGpsState)
- [x] Commit 8aad769 exists (ViewerMap)
- [x] TypeScript: `npx tsc --noEmit` — no errors for either file
- [x] `NEXT_PUBLIC_MAPBOX_TOKEN` present in `.env.local`

## Self-Check: PASSED
