# Phase 7: Viral Media Features — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 07-viral-media-features
**Areas discussed:** Video processing pipeline, Globe tech & country detection, AI narration for documentaries, Animated map export

---

## Video processing pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| Third-party API (Replicate / Creatomate) | Hosted service, ~$0.01–0.05/min output, zero infra | ✓ (after routing) |
| Server-side Next.js API + ffmpeg binary | Full control, needs Railway/container deployment | Initial selection |
| Client-side ffmpeg.wasm | ~30MB WASM, slow on mobile, no server cost | |

**User's choice:** Initially chose server-side ffmpeg; when asked about free options, routed to Creatomate (third-party API with free tier).

**Notes:** User's core concern was avoiding paid infrastructure. Creatomate's free tier satisfies MVP validation needs at zero infra cost.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase Storage (same as photos) | `video-clips` bucket, signed URLs for Creatomate | ✓ (Claude's discretion) |
| Direct to Creatomate | Simpler but ties storage to third-party | |

**User's choice:** "You decide" — Claude chose Supabase Storage for consistency with existing photo upload pattern.

---

## Globe tech & country detection

| Option | Description | Selected |
|--------|-------------|----------|
| react-globe.gl | Three.js-based React component, ready-made, ~300KB | ✓ |
| Three.js via @react-three/fiber | Full control, more code, ~600KB+ | |
| D3 + SVG | Flat 2D, not truly 3D, lighter | |

**User's choice:** react-globe.gl

---

| Option | Description | Selected |
|--------|-------------|----------|
| GPS coordinates → reverse geocode to country | Auto from EXIF, local GeoJSON, no user action | |
| User manually tags countries per trip | Explicit picker, adds friction | |
| Hybrid: GPS first, manual fallback | Auto-detect + picker for missing GPS | ✓ |

**User's choice:** Hybrid — GPS first, manual fallback

---

| Option | Description | Selected |
|--------|-------------|----------|
| Slide-over panel with trip cards (per ROADMAP) | Right-side panel, cards link to /trip/[id] | ✓ |
| Inline tooltip / popup on globe | Small card at click point | |
| You decide | | |

**User's choice:** Slide-over panel with trip cards

---

| Option | Description | Selected |
|--------|-------------|----------|
| Filter trips by year — scrub reveals countries visited over time | Time-travel through travel history | ✓ |
| Scrub through individual trips chronologically | Highlights one trip per position | |
| Keep simple — year filter dropdown instead of scrubber | Dropdown, much simpler to build | |

**User's choice:** Filter trips by year — time-travel scrubber

---

## AI narration for documentaries

| Option | Description | Selected |
|--------|-------------|----------|
| Text subtitles only — no audio track | Gemini writes script, displays as subtitles, no TTS needed | |
| Text-to-speech audio (ElevenLabs / Google TTS) | Gemini script → TTS voiceover audio track | ✓ |
| Browser Web Speech API | Free, robotic voice quality | |

**User's choice:** Text-to-speech audio (ElevenLabs)

---

| Option | Description | Selected |
|--------|-------------|----------|
| ElevenLabs | Best voice quality, 10k chars/mo free tier, REST API | ✓ |
| Google Cloud TTS | WaveNet voices, pay-per-use, fewer services if already on Google Cloud | |
| You decide | | |

**User's choice:** ElevenLabs (recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Gemini analyzes video clips (multimodal video input) | Most impressive, highest quality, Gemini 2.5 Flash supports video | ✓ |
| Reuse existing trip story chapters | Zero extra cost, reuses Phase 3 output | |
| You decide | | |

**User's choice:** Gemini analyzes video clips directly (multimodal)

---

## Animated map export

| Option | Description | Selected |
|--------|-------------|----------|
| Shareable URL only (no file export) for MVP | /map/[id] IS the artifact, deferred file export | ✓ |
| GIF export via canvas-capture (client-side) | html2canvas → GIF, free, limited quality | |
| MP4/WebM via MediaRecorder API (client-side) | Native browser, better quality | |

**User's choice:** Shareable URL only — file export deferred post-MVP

---

| Option | Description | Selected |
|--------|-------------|----------|
| SVG with CSS/SMIL dash-offset animation | Pure SVG, drop-shadow glow, easy amber styling | ✓ |
| Canvas with requestAnimationFrame | More control, needed for export later | |
| Reuse D3-geo from Phase 6 world map | Same projection patterns | |

**User's choice:** SVG with stroke-dashoffset animation (recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Map + trip title/dates + minimal share CTA | Cinematic, viral, "Create yours" CTA | ✓ |
| Map + full chapter breakdown | More content, competes with viewer | |
| You decide | | |

**User's choice:** Map + trip title/dates + "Create yours" CTA

---

| Option | Description | Selected |
|--------|-------------|----------|
| Google Maps dark background (Phase 6 @vis.gl) | Consistent with new viewer | |
| Static styled map image | Lighter, no interactive lib needed | |
| Pure dark canvas (abstract route) | No map tiles, fully on-brand | |

**User's choice (freeform):** "mapbox api is being used" — confirmed Mapbox GL JS (still installed, used in original Phase 4 viewer) as the background map for /map/[id].

---

| Option | Description | Selected |
|--------|-------------|----------|
| Public — anyone with the link can view | Maximizes viral sharing | ✓ |
| Login required to view | Limits viral surface | |

**User's choice:** Public

---

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generated per trip — share button on viewer | Every trip has /map/[id], no extra user action | ✓ |
| User explicitly generates the map | CTA to trigger creation, adds friction | |

**User's choice:** Auto-generated per trip, share button on /trip/[id]

---

## Claude's Discretion

- **Video clip storage:** User said "you decide" — Claude chose Supabase Storage (`video-clips` bucket) for consistency with photo upload pattern.
- **ElevenLabs voice selection:** Claude selects the cinematic English voice best suited for travel documentary narration.
- **`map_id` implementation:** Claude decides whether `/map/[id]` uses trip UUID or a separate short ID.
- **Country GeoJSON dataset:** Claude selects appropriate lightweight Natural Earth dataset.
- **Globe color encoding:** Claude determines exact `react-globe.gl` color props for ink background + amber country glow.
- **Arc count on Memory World:** Claude determines max simultaneous arcs for performance.

## Deferred Ideas

- **File export (GIF/MP4/WebM)** for animated map — deferred post-MVP. User chose shareable URL only for launch.
- **Background music** for documentaries — explicitly deferred in PRD (Phase 2).
- **Documentary MP4 download button** — Creatomate produces an MP4; exposing a download CTA deferred pending user feedback.
- **Collaborative trips** — out of PRD MVP scope.
