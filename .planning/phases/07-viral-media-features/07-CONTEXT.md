# Phase 7: Viral Media Features — Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 delivers three distinct high-shareability features that transform Trailfilm from a story reader into a media creation platform:

1. **AI Micro Documentary** (MICRO-01–05) — Users upload video clips (mp4/mov/webm), Gemini 2.5 Flash analyzes the clips multimodally and writes a narration script, ElevenLabs TTS generates an audio voiceover, and Creatomate assembles the clips + audio into a single edited cinematic documentary with AI subtitles, returned within 5 minutes.

2. **3D Memory World Globe** (MEMORY-01–04) — A `react-globe.gl` powered globe showing all of a user's visited countries glowing in amber. Country detection is hybrid: auto-detect from EXIF GPS via GeoJSON reverse geocode, with a manual country-picker fallback for trips missing GPS. Country click opens a slide-over panel with trip cards linking to the cinematic viewer. A horizontal timeline scrubber at the bottom filters the globe by year — dragging reveals which countries glowed each year.

3. **Animated Travel Map Share Page** (ANIM-01–03) — Every trip auto-generates a public `/map/[id]` page. Mapbox GL JS provides the dark map background. Animated SVG route lines (amber `#E5A663`, `stroke-dashoffset` animation) draw the journey path. Flight arc curves connect stops. The page shows the route + trip title/dates + a "Create yours" CTA. Auto-generated per trip; a "Share Map" button on `/trip/[id]` copies the link.

</domain>

<decisions>
## Implementation Decisions

### Micro Documentary — Video Processing
- **MICRO-D-01:** Use **Creatomate** as the video assembly service (third-party API, free tier for MVP). Handles ffmpeg-level editing (clip concatenation, transitions, subtitle overlay, audio track mixing) without any server infrastructure. REST API — one call with a template + assets, polls for job completion.
- **MICRO-D-02:** Video clips uploaded to **Supabase Storage** in a dedicated `video-clips` bucket (same pattern as photo uploads in `public.photos`). Creatomate fetches clips via signed URLs. Keeps all user media in one storage provider.
- **MICRO-D-03:** Upload UI: extend the existing dropzone to add a separate **"Video clips" tab** alongside the existing Photos tab. Accept `mp4, mov, webm`. Per-clip progress ring during upload. Single amber CTA **"Create Documentary"** — no wizard steps per ROADMAP UI constraints.
- **MICRO-D-04:** Processing status: poll `/api/documentary/[id]/status` (similar to existing Phase 3 `/api/generate-story` polling at 4s intervals). Show `GenerationProgress` component reused from Phase 3 while Creatomate processes.

### Micro Documentary — AI Narration
- **MICRO-D-05:** Narration is **text-to-speech audio** — not silent subtitles only.
- **MICRO-D-06:** **Gemini 2.5 Flash** generates the narration script by analyzing the uploaded video clips directly (multimodal video input). The model describes what it sees in each clip and writes a matching cinematic narration. This is a separate Gemini call from the story generation in Phase 3.
- **MICRO-D-07:** **ElevenLabs** converts the Gemini-written script to an audio voiceover. Use ElevenLabs REST API (free tier: 10,000 chars/mo). A cinematic English voice from ElevenLabs' voice library — Claude selects the best match for travel documentary tone.
- **MICRO-D-08:** The generated audio file is stored in Supabase Storage (`documentary-audio` bucket) and passed to Creatomate as an asset alongside the video clips.
- **MICRO-D-09:** The documentary player: full-bleed cinematic player, `bg-ink` canvas. Subtitles overlay at bottom per ROADMAP spec (`font-sans text-sm text-parchment-200 bg-ink/70 backdrop-blur-sm px-3 py-1 rounded-md`).

### 3D Memory World Globe
- **GLOBE-D-01:** Use **`react-globe.gl`** (Three.js-based). Deep ink background (`#0A0A0A`), amber glow on visited countries (`#E5A663`), no blue/purple tones. Loaded via `next/dynamic` with `{ ssr: false }` (browser-only WebGL).
- **GLOBE-D-02:** Country detection — **hybrid**: first attempt reverse geocoding from photo EXIF GPS coordinates using a local country-borders GeoJSON dataset (e.g. `world-countries.json` from Natural Earth). When GPS is missing on a trip, show a country-picker UI (searchable select) on the trip detail page as a fallback. Store `iso_country_code` on each trip row in Supabase.
- **GLOBE-D-03:** Country click → **slide-over panel** (right-side, matching existing component patterns). Panel shows trip cards from that country — same card design as dashboard Trip cards. Each card links to `/trip/[id]` cinematic viewer.
- **GLOBE-D-04:** **Timeline scrubber** at bottom: horizontal amber progress bar. Dragging filters the globe to show only trips/countries visited in the selected year. Reveals the user's travel history year by year.
- **GLOBE-D-05:** Globe lives at `/dashboard/world` (a new route under the app layout). Link from the main dashboard nav.

### Animated Travel Map Share Page
- **ANIM-D-01:** `/map/[id]` is a **public, unauthenticated page** (same model as `/t/[slug]` from Phase 5 sharing). Anyone with the link can view — maximizes viral sharing.
- **ANIM-D-02:** The map is **auto-generated per trip** — no explicit user creation step. A "Share Map" button on `/trip/[id]` copies the `/map/[id]` URL. The `map_id` is stored on the trip row (or is the trip ID itself).
- **ANIM-D-03:** Map background: **Mapbox GL JS** (currently installed in `package.json`, used in the original viewer). Dark style. Route SVG/canvas overlay on top.
- **ANIM-D-04:** Route animation: **SVG with `stroke-dashoffset` CSS animation**. Amber route lines `#E5A663` with `filter: drop-shadow(0 0 8px rgba(229,166,99,0.6))`. Animated dashes travel along the path. Flight arc curves use quadratic bezier SVG paths between stops. `useReducedMotion()` collapses animation duration to 0.
- **ANIM-D-05:** Page content: animated route fills most of the screen, trip name and travel dates overlaid, a single **"Create yours →"** CTA at the bottom driving new user acquisition. Minimal, cinematic, marketing-grade.
- **ANIM-D-06:** The page has its own OG meta tags (trip title, a static map screenshot or first photo as OG image) for WhatsApp/Twitter link previews.

### Claude's Discretion
- ElevenLabs voice selection: Claude picks the cinematic English voice from ElevenLabs' voice library that best matches a travel documentary narrator tone.
- `map_id` implementation: Claude decides whether `/map/[id]` uses the trip's existing UUID or a separate short ID.
- Country GeoJSON dataset: Claude selects an appropriate lightweight Natural Earth dataset for reverse geocoding.
- Globe color encoding: Claude decides exact `react-globe.gl` color props for the ink background + amber country glow to match the Trailfilm design system.
- Arc pair count and selection on the Memory World globe: Claude determines the max arcs shown simultaneously for performance.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system (non-negotiable)
- `.planning/ROADMAP.md` §Design System & UI Constraints — color tokens, motion principles, amber-only accent rule. All Phase 7 surfaces must build to this system.
- `.planning/ROADMAP.md` §Phase 7 — UI constraints for each feature (documentary player subtitles, globe spec, animated map route line spec, export button)

### Existing patterns to reuse / extend
- `src/components/viewer/CinematicViewer.tsx` — dynamic import pattern with `{ ssr: false }` for browser-only libs; `ViewerMap` wrapping approach. Memory World globe and Mapbox map page must follow the same dynamic import pattern.
- `src/app/(app)/trip/[id]/page.tsx` — trip detail page where "Share Map" button and "Create Documentary" CTA will be added
- `src/app/(public)/t/[slug]/page.tsx` — public share page pattern from Phase 5. `/map/[id]` must follow the same public route pattern (no auth middleware check)
- `src/lib/gemini/generateStory.ts` — existing Gemini multimodal call pattern. New `generateNarrationScript.ts` should follow the same pattern.
- `src/stores/` — Zustand store patterns used in Phase 3 wizard; any documentary upload wizard state should follow the same approach.
- `src/app/api/generate-story/route.ts` — API route with polling pattern (4s interval, generating/completed/failed lifecycle). Documentary processing route should mirror this.

### Phase 5 context (public sharing)
- `.planning/phases/05-sharing-deploy/05-CONTEXT.md` — public trip URL decisions; RLS policy for public access. `/map/[id]` needs the same public access pattern.

### Phase 3 context (Gemini + generation UI)
- `.planning/phases/03-ai-story-generation/` — GenerationProgress component, polling logic, Gemini client setup. All reusable for documentary generation.

### External APIs (no local files — online)
- Creatomate REST API docs — for video assembly job submission and polling
- ElevenLabs TTS REST API docs — for text-to-speech audio generation
- `react-globe.gl` docs / GitHub — props for background color, polygon color, marker placement, click events
- Mapbox GL JS docs — for `/map/[id]` background (already used in Phase 4 viewer)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/viewer/NoGpsState.tsx` — pattern for graceful fallback when GPS is missing. Memory World globe will need a similar "no trips yet" empty state.
- `GenerationProgress` component (Phase 3) — animated status text + CSS progress bar + inline retry error. Reusable for documentary processing status.
- `StepIndicator` (Phase 3 wizard) — numbered amber circles. If documentary upload becomes multi-step in future, this component is ready.
- Phase 5 public share page layout — minimal, no nav, no auth. `/map/[id]` uses the same layout shell.
- `src/app/(marketing)/page.tsx` world-map section — `useReducedMotion()` SVG arc animation pattern. `/map/[id]` animated route SVG should follow the same reduced-motion guard approach.

### Established Patterns
- **`next/dynamic` with `{ ssr: false }`** — mandatory for all WebGL/browser-only components (Globe, Mapbox map). Already applied to `ViewerMap`.
- **Supabase Storage signed URLs** — already used for photo uploads. Video clips and generated audio use the same signed URL pattern for Creatomate access.
- **`pnpm add`** — package manager for all new installs (`react-globe.gl`, ElevenLabs SDK if one exists, etc.)
- **`useReducedMotion()` from framer-motion** — gates all animations. SVG `stroke-dashoffset` animations on `/map/[id]` must check this and collapse to 0 duration.
- **Polling at 4s intervals** — established in Phase 3 for story generation. Documentary processing uses same interval.
- **RLS policies in Supabase** — Phase 5 set up public access for trip viewer. `/map/[id]` needs analogous public SELECT on the trips/map data.

### Integration Points
- **New Supabase tables/columns needed:** `iso_country_code` column on trips table (for Globe); `documentary_id` / `documentary_url` column on trips table; possibly a `documentaries` table for the Creatomate job lifecycle.
- **New Supabase Storage buckets:** `video-clips` (private, auth required), `documentary-audio` (private), `documentaries` (public or signed, for the final MP4 output).
- **New API routes:** `POST /api/documentary` (submit clips to Creatomate), `GET /api/documentary/[id]/status` (poll), `POST /api/narration` (ElevenLabs TTS call).
- **New pages:** `/dashboard/world` (Memory World globe — authenticated), `/map/[id]` (animated travel map — public).
- **`/trip/[id]` additions:** "Create Documentary" CTA + "Share Map" button added to the existing trip detail page.

</code_context>

<specifics>
## Specific Ideas

- The ROADMAP explicitly specifies the documentary player subtitle style: `font-sans text-sm text-parchment-200 bg-ink/70 backdrop-blur-sm px-3 py-1 rounded-md` centered at bottom. Downstream agents must match this exactly.
- The ROADMAP specifies the animated map route line style: `#E5A663` with `filter: drop-shadow(0 0 8px rgba(229,166,99,0.6))`, animated dashes traveling along the path, flight arc curves as quadratic bezier.
- Memory World globe: the ROADMAP specifies "deep ink background, amber glow on visited countries, no blue/purple tones. Country click → slide-over panel."
- The upload UI: the ROADMAP specifies "extend existing dropzone to accept video files; separate 'Video clips' tab from photos. Progress ring per clip during processing. Single amber CTA 'Create Documentary' — never split into wizard steps."
- `/map/[id]` page should have OG meta tags for WhatsApp link previews — this is critical for the viral mechanic to work (users share on WhatsApp to friends in India).
- "Create yours →" CTA at the bottom of `/map/[id]` is the primary acquisition mechanic — should link to `/` (marketing page) or `/auth` with a compelling call-to-action matching the cinematic brand voice.

</specifics>

<deferred>
## Deferred Ideas

- **File export (GIF/MP4/WebM)** — User specifically decided to defer file export for the animated map. `/map/[id]` ships as shareable URL only. The export button mentioned in the ROADMAP is deferred post-MVP. Note for future phase: canvas-capture via MediaRecorder API (WebM) is the recommended approach when this ships.
- **Background music for documentaries** — PRD explicitly deferred music to Phase 2. ElevenLabs generates voiceover only; no background soundtrack in this phase.
- **Collaborative trips** — Out of PRD MVP scope.
- **Video export (MP4 download)** of the documentary — The Creatomate output is a final MP4 that could be made downloadable; decision to expose a download button is deferred pending user feedback on the feature.

</deferred>

---

*Phase: 07-viral-media-features*
*Context gathered: 2026-05-20*
