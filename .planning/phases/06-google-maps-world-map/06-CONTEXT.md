# Phase 6: Google Maps Migration & World Map Component — Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 delivers two distinct but related changes:

1. **Viewer map migration** — Replace `mapbox-gl` entirely with `@vis.gl/react-google-maps` in `src/components/viewer/ViewerMap.tsx`. All existing viewer behaviors (per-chapter flyTo, dashed amber path, click-to-place pin mode, mobile bottom sheet / desktop sidebar layout, NoGpsState fallback) carry over to the Google Maps API surface. `mapbox-gl` and `@types/mapbox-gl` are removed from `package.json` and `NEXT_PUBLIC_MAPBOX_TOKEN` is removed from `.env.example`.

2. **Landing page world map** — Replace the existing `WorldMapSection` component (SVG path world + `JourneyPin` tooltips) in `src/app/(marketing)/page.tsx` with an Aceternity-style animated arc world map. This requires creating `src/components/ui/world-map.tsx` from scratch using D3 geo projections + SVG arc animations, and a wrapper section that matches the Trailfilm brand system.

</domain>

<decisions>
## Implementation Decisions

### Google Maps Library
- **D-01:** Use `@vis.gl/react-google-maps` — the official Google library, actively maintained, full TypeScript support, works with Next.js App Router. Install: `pnpm add @vis.gl/react-google-maps`.
- **D-02:** `APIProvider` from `@vis.gl/react-google-maps` wraps the `ViewerMap` dynamic import (or its parent). The `Map` component replaces the `mapboxgl.Map` imperative init.

### Map Behaviors to Preserve
- **D-03:** Both key behaviors carry over: **flyTo** (becomes `map.panTo` + `map.setZoom` on the Google Maps instance when active chapter changes) and **click-to-place pin mode** (uses the Google Maps `onClick` prop to get `LatLng`).
- **D-04:** Path stays **dashed amber** (`#E5A663`). Use Google Maps `Polyline` with an SVG icon pattern (dash + gap) to replicate the `line-dasharray` from Mapbox. Solid amber fallback if SVG icon pattern has cross-browser issues.
- **D-05:** Map is **fully interactive** — user can pan and zoom freely in addition to auto-flyTo on chapter scroll.

### Map Dark Style
- **D-06:** Use Google Maps built-in **`colorScheme: "DARK"`** (or `mapId` with a dark Cloud-hosted style) rather than a custom JSON styles array. Simpler to maintain. Pass `colorScheme="DARK"` to the `<Map>` component (or use a `mapId` from Google Cloud Console if colorScheme is insufficient).
- **D-07:** Strip default Google Maps UI chrome (street view control, map type control, zoom control default positioning) to keep the viewer minimal and cinematic. Keep zoom gestures and pan enabled.

### World Map Component (Landing Page)
- **D-08:** Build `src/components/ui/world-map.tsx` from scratch to match the Aceternity `WorldMap` API (`dots` prop: array of `{ start: {lat, lng}, end: {lat, lng} }`). Uses `d3-geo` (specifically `geoNaturalEarth1` projection + `geoPath`) for accurate equirectangular arc drawing. Install: `pnpm add d3-geo @types/d3-geo`.
- **D-09:** **Replace `WorldMapSection` entirely** — delete the existing SVG world map, `JourneyPin` component, `WORLD_PATHS` data, `journeyPins` array, and the `WorldMapSection` function from `page.tsx`. Replace with a `WorldMapSection` that wraps the new `WorldMap` component.
- **D-10:** Use the **Trailfilm brand voice and existing journey locations** for dot connections — not the "Remote Connectivity" copy from the Aceternity demo. Headline stays "Journeys archived across the world." Arcs connect geographically interesting pairs from the 12 existing journey locations (Iceland↔Mongolia, Morocco↔Ethiopia, Alaska↔Patagonia, etc.). Claude picks the arc pairs that look visually balanced on the map.
- **D-11:** The `WorldMapDemo` wrapper provided by the user becomes the `WorldMapSection` function body. The `WorldMap` component accepts the `dots` prop and handles all D3 projection + animation internally. `useReducedMotion()` must gate the arc animations (still SVG, but animation duration → 0).

### API Key & Env Vars
- **D-12:** Single env var: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Add to `.env.local` (not committed), add placeholder to `.env.example`. Remove `NEXT_PUBLIC_MAPBOX_TOKEN` from `.env.example`.
- **D-13:** Plan includes a **human-action step**: restrict the Google Maps API key in Google Cloud Console to HTTP referrers `https://trailfilm.vercel.app/*` and `http://localhost:3000/*`. This is required before deployment.
- **D-14:** Enable **Maps JavaScript API** (and optionally Maps Embed API) in Google Cloud Console. Plan documents this as a prerequisite human step.
- **D-15:** Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to Vercel environment variables (production + preview). Plan documents this as a deployment step.

### Cleanup
- **D-16:** Remove `mapbox-gl` and `@types/mapbox-gl` from `package.json`. Also remove the `mapbox-gl/dist/mapbox-gl.css` import from `ViewerMap.tsx`. Run `pnpm install` to update lockfile.

### Claude's Discretion
- Arc pair selection for the `WorldMap` dots: Claude picks 6-8 arc connections from the 12 journey locations that look visually balanced across hemispheres and match the travel-archive narrative.
- Exact zoom level and center for each `flyTo` equivalent: match or improve on the current Mapbox implementation (zoom 10, 1500ms duration).
- Marker style for Google Maps: amber dots (`#E5A663`), closest visual match to current Mapbox 8px amber dots.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing files being replaced / modified
- `src/components/viewer/ViewerMap.tsx` — full Mapbox implementation being replaced; read for: prop interface (`ChapterCoord`, `ViewerMapProps`), all behaviors to preserve (flyTo, pin placement, path drawing), responsive layout classes (mobile bottom sheet / desktop sidebar)
- `src/components/viewer/CinematicViewer.tsx` — wraps `ViewerMap` via dynamic import; read for: how `ViewerMap` is imported and used, `chapterCoords` + `activeChapterIndex` + `pinPlacingForChapter` prop flow
- `src/app/(marketing)/page.tsx` — landing page; read for: `WorldMapSection` function, `JourneyPin` component, `WORLD_PATHS` data, `journeyPins` array — all to be deleted and replaced

### Design system
- `.planning/ROADMAP.md` §Design System & UI Constraints — color tokens, motion principles, amber-only accent rule. Amber `#E5A663` is the only hue for map markers and path.

### Phase 4 context (Mapbox decisions)
- `.planning/phases/04-cinematic-viewer/04-CONTEXT.md` — original Mapbox decisions (D-05: dashed amber path; sidebar/bottom-sheet layout; NoGpsState)
- `.planning/phases/04-cinematic-viewer/04-02-PLAN.md` — original Mapbox implementation plan; useful for understanding what was built

### External API docs (no local files — online)
- `@vis.gl/react-google-maps` docs: https://visgl.github.io/react-google-maps/ — `APIProvider`, `Map`, `Marker`, `Polyline` APIs
- `d3-geo` docs: `geoNaturalEarth1`, `geoPath` — for WorldMap SVG projection

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/viewer/NoGpsState.tsx` — already exists; carry forward unchanged. Renders when `chapterCoords.length === 0` and not in pin-placing mode.
- `src/components/viewer/LocationEditor.tsx` — sits above the map panel in `CinematicViewer`; interfaces with `ViewerMap` via props only, not internal Mapbox APIs. No changes needed.
- `useReducedMotion()` from `framer-motion` — already used throughout; WorldMap must check it and skip arc animations.

### Established Patterns
- **Dynamic imports for browser-only** — `CinematicViewer.tsx` already uses `next/dynamic` with `{ ssr: false }` for `ViewerMap`. The same pattern must be kept since `@vis.gl/react-google-maps` also uses browser APIs.
- **Framer Motion gating** — `useReducedMotion()` is checked in every animated component. WorldMap must follow this pattern; `d3-geo` + SVG animations should collapse to 0ms duration when reduced motion is active.
- **Tailwind responsive classes** — map panel layout uses raw Tailwind: `fixed bottom-0 left-0 right-0 h-[40dvh]` (mobile) → `md:top-0 md:right-0 md:h-[100dvh] md:w-[38vw]` (desktop). These classes belong to the wrapper div, not the map library — they carry forward unchanged.
- **`pnpm` package manager** — all installs use `pnpm add`, not `npm install`.

### Integration Points
- `APIProvider` from `@vis.gl/react-google-maps` must wrap the `ViewerMap` component. Best placed in `CinematicViewer.tsx` (around the `ViewerMap` dynamic import) or in the viewer page RSC. Do NOT add it to the global layout — it should only load on viewer routes.
- `src/app/(marketing)/page.tsx` is a `'use client'` component; `world-map.tsx` must also be `'use client'` (uses `useEffect` / motion).
- `d3-geo` is a pure computation library (no DOM APIs) so it can be used server-side safely, but since `page.tsx` is already a client component this is moot.

</code_context>

<specifics>
## Specific Ideas

- The user provided the exact `WorldMapDemo` component code. The `WorldMapSection` function in `page.tsx` should match its structure: centered layout, `motion.span` letter-by-letter animation on the section headline, `WorldMap` component below with the `dots` array.
- The section headline should be adapted to Trailfilm brand voice: e.g., "Global" / "Connectivity" in the animated span pattern — or reuse "Journeys archived across the world." with animated letters. Claude adapts the Aceternity demo copy to fit the Trailfilm cinematic tone.
- The `WorldMap` component dots should span multiple continents — visually interesting arcs, not just clustered in one region.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-google-maps-world-map*
*Context gathered: 2026-05-20*
