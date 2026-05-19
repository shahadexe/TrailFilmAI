# Phase 4: Cinematic Viewer - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

The `/trip/[id]` route is transformed from a constrained app-interior layout into a full-screen, scroll-driven cinematic experience. Users scroll through their trip story as a series of full-bleed chapter sections — each with a parallax photo backdrop, animated chapter title and narrative text, and a Mapbox map panel that flies to each chapter's GPS location as it enters the viewport.

**In scope:** `/trip/[id]` cinematic viewer (replaces Phase 3 detail page for completed trips), photo parallax via Framer Motion `useScroll`/`useTransform`, chapter narrative text animation, ghost floating AppNav, Mapbox animated map (sidebar desktop / bottom sheet mobile), GPS coordinate fetching from the server RSC, scroll-progress amber hairline indicator, no-GPS-data map state.

**Out of scope:** Manual location entry when GPS is missing (deferred), public viewer (Phase 5), OG meta tags (Phase 5), video export, voice narration, per-chapter share actions.

</domain>

<decisions>
## Implementation Decisions

### Viewer Entry Point
- **D-01:** The cinematic viewer **replaces `/trip/[id]`** — there is no separate `/view` sub-route. One URL, one destination. The current Phase 3 detail page (photo grid + text chapter list) is absorbed into the cinematic viewer layout for completed trips. Draft/generating/failed trips continue to use the Phase 3 states (DraftStoryCTA, GeneratingStoryState).
- **D-02:** The **AppNav is preserved as a ghost floating nav** that fades to near-invisible as the user scrolls into the story, and reappears on scroll-up. This gives a reliable exit path (back to dashboard) without chrome dominating the cinematic experience.

### Map Layout
- **D-03:** Mapbox map lives in a **sidebar on desktop / bottom sheet on mobile** — the ROADMAP spec exactly. Desktop: fixed right-side panel (~35–40% viewport width). Mobile: sticky bottom panel (~40dvh). The story/text content occupies the remaining width/height.
- **D-04:** The map **animates per chapter** — `flyTo` each chapter's GPS location as that chapter enters the viewport (scroll-linked via IntersectionObserver or Framer Motion `useInView`). This is the Build Guide §10.6 pattern.
- **D-05:** Map path line style — **Claude's discretion** (user asked design skills to choose). Options: dashed amber (#E5A663, Build Guide spec) vs. solid amber. The decision should align with the brand's archival/cinematic aesthetic.

### GPS Data
- **D-06:** GPS coordinates are fetched **server-side in the viewer RSC**. The `photos` table has `latitude`/`longitude`. The server component queries: for each chapter's `photo_ids`, look up the first photo's GPS. Pass only `{ chapterIndex, lat, lng }[]` tuples to the client — never raw GPS in photo objects (preserves the Phase 2 security decision to strip GPS from the RSC payload).
- **D-07:** The data shape passed to the map client component: `{ chapterIndex: number; lat: number; lng: number; label?: string }[]` — built server-side and serialized as a plain prop.

### No-GPS Fallback
- **D-08:** When a trip has no GPS data in any photo, the **map panel renders with a subtle "No location data" message** over the dark map canvas (map still mounts but shows no markers or path). The map panel does not hide — layout consistency is maintained across all trips. A future phase can unlock the map via manual location entry (noted as deferred idea).

### Claude's Discretion
- Map path line style (dashed vs. solid) — user delegated to design skills. Recommend choosing based on brand aesthetic (archival/archival → dashed; modern → solid).
- Exact chapter text layout and spacing within each full-screen section.
- Exact ghost nav fade behavior (opacity curve, scroll threshold, transition duration).
- Whether chapter number "Chapter 01" eyebrow sits above or below the chapter title.
- Scroll-progress indicator exact positioning and thickness (left edge per ROADMAP spec).
- Whether the map sidebar has an inner border/shadow separating it from the story content.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary Build Guide
- `Ideation/02_MVP_BUILD_GUIDE.md` §10.5 — `StoryChapter.tsx` skeleton — `useScroll`, `useTransform`, parallax photo, text fade-in pattern. This is the single most important implementation reference.
- `Ideation/02_MVP_BUILD_GUIDE.md` §10.6 — `AnimatedMap.tsx` skeleton — Mapbox GL setup, `dark-v11` style, amber line, marker pattern, `flyTo` logic.
- `Ideation/02_MVP_BUILD_GUIDE.md` §6.3 — Mapbox install already done (mapbox-gl + @types/mapbox-gl installed). `NEXT_PUBLIC_MAPBOX_TOKEN` must be in `.env.local`.
- `Ideation/02_MVP_BUILD_GUIDE.md` §14.3 — Mapbox token domain restrictions (relevant for deploy, not Phase 4 itself).

### Design System
- `Ideation/03_DESIGN_AND_BRAND.md` — Brand voice, motion principles, atmospheric layer stack. Critical for all copy and visual decisions in the viewer.
- `.planning/ROADMAP.md` §Phase 4 UI constraints — Locked UI spec: `min-height: 100dvh`, `.gradient-fade-bottom` photo overlay, `useInView({ once: true, margin: "-120px" })`, paragraph stagger, map sidebar desktop/bottom sheet mobile, amber left-edge scroll progress indicator, `text-wrap: balance` on headlines, `leading-[1.75]` body prose, `max-w-[62ch]`.
- `.planning/phases/02-trip-management-photo-upload/02-UI-SPEC.md` — Typography scale, color tokens, spacing — carries forward with no changes.
- `.planning/phases/03-ai-story-generation/03-UI-SPEC.md` — Motion constants and design system additions from Phase 3 that Phase 4 inherits.

### Existing Schema (already live)
- `src/types/database.ts` — `StoryChapter` interface (`id, trip_id, chapter_index, title, narrative, photo_ids uuid[], location_name`). `Photo` interface (`latitude, longitude` — these are the GPS source for D-06).
- `Ideation/02_MVP_BUILD_GUIDE.md` §7 — DB schema: `story_chapters` table, `photos` table with `latitude`/`longitude`.

### Requirements
- `.planning/REQUIREMENTS.md` — VIEW-01, VIEW-02, VIEW-03 are Phase 4 acceptance targets.
- `.planning/ROADMAP.md` §Phase 4 success criteria — 4 criteria (parallax+narrative on scroll, animated Mapbox map with path, brand-compliant rendering, 375px usability).

### Existing Code (reuse/extend)
- `src/app/(app)/trip/[id]/page.tsx` — Phase 3 RSC; Phase 4 replaces its render output for completed trips while keeping the auth/ownership/DB queries. Add GPS coordinate extraction per D-06.
- `src/components/trip/TripDetailHeader.tsx` — Phase 3 header; Phase 4 may hide or transform it into the ghost floating nav behavior (D-02).
- `src/components/trip/DraftStoryCTA.tsx` — Preserved for draft trips (not completed).
- `src/components/trip/GeneratingStoryState.tsx` — Preserved for generating trips (not completed).
- `src/app/(app)/layout.tsx` — AppNav lives here; Phase 4 may need to suppress or modify the nav on the trip detail route for the ghost effect.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `framer-motion` — already installed (v12.38.0). `useScroll`, `useTransform`, `useInView`, `AnimatePresence`, `motion` — all available. `useReducedMotion()` pattern established in Phases 2 and 3.
- `mapbox-gl` + `@types/mapbox-gl` — already installed (v3.23.1). No new installs needed for the map.
- `src/components/trip/StoryChapterBlock.tsx` — Phase 3 chapter block with `useInView` scroll entrance. Phase 4 replaces this with a full-screen cinematic section, but the `useInView` + `once: true` pattern carries forward.
- `src/app/globals.css` — `.gradient-fade-bottom`, `.gradient-fade-top`, `.grain-overlay`, `.ambient-glow`, `.progress-indeterminate`, `@keyframes float-bokeh`, `@keyframes glow-breathe` all already defined.
- `src/lib/supabase/server.ts` — Server Supabase client for RSC GPS fetch.

### Established Patterns
- **`useScroll` + `useTransform` for parallax:** Framer Motion pattern; `offset: ['start end', 'end start']` for full scroll range. Already documented in Build Guide §10.5.
- **`useReducedMotion()` gate:** Mandatory on every Framer Motion animation. All Phases 1-3 use this — Phase 4 must too.
- **RSC for page-level data:** `/trip/[id]/page.tsx` is an async RSC. Phase 4 extends the existing DB query to include GPS data per D-06.
- **`dynamic()` import for Mapbox:** `dynamic(() => import('./AnimatedMap'), { ssr: false })` — Mapbox uses browser APIs; cannot be server-rendered. Must use Next.js dynamic import with `ssr: false`.
- **`min-height: 100dvh` NOT `100vh`:** iOS Safari viewport bug. ROADMAP mandates `100dvh` for all chapter sections.
- **`object-cover` + `fill` on Next.js `<Image>`:** Established for photo grid; carries to parallax background.

### Integration Points
- `src/app/(app)/trip/[id]/page.tsx` → New cinematic viewer components (ChapterSection, ViewerMap, ViewerNav)
- GPS data flow: `photos` table `.select('id, latitude, longitude')` → RSC → `chapterCoords` prop → `ViewerMap` client component
- AppNav fade behavior: ghost nav needs scroll detection — either CSS `scroll-timeline` or a thin `useScroll` client wrapper on the page
- `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable must be set in `.env.local` and in Vercel project settings before deployment

</code_context>

<specifics>
## Specific Ideas

- **Chapter section structure:** Full-bleed `section` with `min-height: 100dvh`, `position: relative`, `overflow: hidden`. Photo fills the section as the parallax background (`motion.div` with `y: useTransform(scrollYProgress, [0,1], ['-10%','10%'])`). Gradient overlay (`gradient-fade-bottom`) darkens bottom 40% for text legibility. Text content sits in a `z-10` layer centered or left-aligned.
- **Parallax range:** Build Guide uses `-10%` to `10%` (`useTransform(scrollYProgress, [0,1], ['-10%','10%'])`). The `motion.div` wrapper gets `scale-110` so the parallax edges don't expose white borders.
- **Text fade-in:** `textOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])` + `textY = useTransform(scrollYProgress, [0.1, 0.3], [40, 0])` — exact values from Build Guide §10.5.
- **Scroll progress indicator:** Thin amber `position: fixed` left-edge element. Height drives from `scrollYProgress` (page-level `useScroll`, not per-chapter). Pure CSS `height` manipulation via a `motion.div` with `scaleY: scrollYProgress` or `height: scrollPercent`.
- **Dynamic map import:** `const ViewerMap = dynamic(() => import('@/components/viewer/ViewerMap'), { ssr: false })` — prevents SSR import of `mapbox-gl`.
- **Map sidebar desktop:** `position: fixed`, right-aligned, `width: 35–40vw`, `height: 100dvh`. Story content gets `max-width` offset so it doesn't overlap.
- **Map bottom sheet mobile:** `position: fixed`, bottom-aligned, `width: 100%`, `height: 40dvh`. Story content gets `padding-bottom: 40dvh`.
- **FlyTo trigger:** `IntersectionObserver` on each chapter section (or `useInView` from Framer Motion). When chapter N enters the viewport (threshold ~0.3), call `map.current.flyTo({ center: [lng, lat], zoom: 10, duration: 1500, essential: true })`.
- **Amber path draw animation:** On map load, animate the line layer drawing from start to end using Mapbox `line-dasharray` animation trick (shrink dash offset over time) for a "path being traced" effect.

</specifics>

<deferred>
## Deferred Ideas

- **Manual location entry:** When no GPS is found in photos, prompt the user to enter locations for their chapters. Would unlock the map for GPS-free trips. Belongs in a post-MVP enhancement phase.
- **Public viewer:** Identical cinematic viewer accessible without authentication via a shareable URL. Scoped to Phase 5.
- **OG meta tags for sharing:** `og:title`, `og:description`, `og:image` on trip pages. Phase 5.
- **Scroll-driven chapter map (full-screen map section between chapters):** A dramatic alternative to the sidebar layout — user considered but current decision is sidebar/bottom-sheet per ROADMAP spec.
- **Floating overlay toggle map:** Map hidden by default, toggled via icon. Rejected in favor of always-visible sidebar.

</deferred>

---

*Phase: 4-cinematic-viewer*
*Context gathered: 2026-05-19*
