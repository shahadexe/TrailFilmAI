# Phase 4: Cinematic Viewer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 4-cinematic-viewer
**Areas discussed:** Viewer entry point, Map layout, GPS data for chapters, No-GPS fallback

---

## Viewer Entry Point

### Q1: Where does the viewer live?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace /trip/[id] | Viewer replaces current detail page. One URL, one destination. | ✓ |
| New /trip/[id]/view route | Keep detail page, add viewer sub-route. Two modes: manage vs. experience. | |
| Conditional on generation_status | Draft → detail page; completed → viewer at same URL. | |

**User's choice:** Replace /trip/[id] (recommended option)
**Notes:** Cleanest mental model for sharing. Phase 3 photo grid + text chapters absorbed into viewer layout.

---

### Q2: What happens to the AppNav?

| Option | Description | Selected |
|--------|-------------|----------|
| Ghost floating nav (fades on scroll) | Semi-transparent, fades out on scroll, reappears on scroll-up. | ✓ |
| No nav at all | Pure full-bleed. Browser back only. | |
| Minimal overlay controls | No AppNav; floating back arrow + share button in corners. | |

**User's choice:** Ghost floating nav — fades on scroll
**Notes:** Gives a reliable exit path without dominating the cinematic experience.

---

## Map Layout

### Q1: Where does the Mapbox map live?

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar (desktop) + bottom sheet (mobile) | Fixed right panel ~35-40% desktop; sticky bottom ~40dvh mobile. ROADMAP spec. | ✓ |
| Dedicated full-screen map chapter | A full-screen section between story chapters. | |
| Floating overlay toggle | Map hidden by default, toggled via icon. | |

**User's choice:** Sidebar (desktop) + bottom sheet (mobile)
**Notes:** Matches ROADMAP §Phase 4 constraints exactly.

---

### Q2: Does the map animate per chapter or show the full journey?

| Option | Description | Selected |
|--------|-------------|----------|
| Animates per chapter (scroll-linked flyTo) | Map flyTo each chapter's location as it enters viewport. | ✓ |
| Full journey visible from the start | fitBounds overview, no flyTo. Simpler, more reliable. | |
| Full journey on load, flyTo on chapter | fitBounds overview first, then flies to each chapter. | |

**User's choice:** Animates per chapter (scroll-linked flyTo)
**Notes:** Build Guide §10.6 pattern. IntersectionObserver or Framer Motion useInView triggers flyTo.

---

### Q3: Map path line style?

| Option | Description | Selected |
|--------|-------------|----------|
| Dashed amber line (Build Guide spec) | line-dasharray [2,2], amber #E5A663, opacity 0.8. Archival feel. | |
| Solid amber line | Cleaner, more modern. Higher contrast. | |

**User's choice:** "Use the design skills to choose this" — delegated to Claude
**Notes:** Claude should choose based on brand aesthetic (archival/cinematic → lean toward dashed; could also do solid for clarity).

---

## GPS Data for Chapters

### Q1: How to get GPS coordinates to the viewer?

| Option | Description | Selected |
|--------|-------------|----------|
| Fetch lat/lng server-side in the viewer RSC | Add GPS query to existing RSC; pass only coordinate tuples to client. | ✓ |
| Add lat/lng to story_chapters when generated | Store GPS on story_chapters during generation. No extra fetch needed. | |
| Geocode location_name strings at render time | Client-side geocoding of stored location names. | |

**User's choice:** Fetch lat/lng server-side in the viewer RSC (recommended option)
**Notes:** Preserves Phase 2 security decision (no raw GPS in photo RSC payload). Only clean `{ chapterIndex, lat, lng }` tuples go to the client.

---

## No-GPS Fallback

### Q1: What shows when a trip has no GPS data?

| Option | Description | Selected |
|--------|-------------|----------|
| Hide map entirely | Map panel doesn't render. Story fills full width. | |
| Show map with 'No location data' note | Map panel renders with subtle message. Layout stays consistent. | ✓ |

**User's choice:** Show map with a 'No location data' note
**Notes:** User's initial suggestion was to prompt the user to enter locations manually when GPS is missing — noted as a deferred idea for a future phase. For Phase 4's MVP, map panel renders with a placeholder state.

---

## Claude's Discretion

- **Map line style:** Dashed vs. solid amber path — user delegated to design skills. Recommend choosing based on archival/cinematic brand aesthetic.
- **Exact ghost nav fade behavior:** Opacity curve, scroll threshold, transition duration.
- **Chapter text layout and spacing** within each full-screen section.
- **Chapter eyebrow positioning:** Whether "Chapter 01" sits above or below the title.
- **Scroll-progress indicator** exact thickness and left-edge positioning.
- **Map sidebar inner border/shadow** separating it from story content.

## Deferred Ideas

- **Manual location entry:** Prompt user to enter chapter locations when no GPS found. Unlocks the map for GPS-free trips. Post-MVP enhancement.
- **Full-screen map chapter:** Dramatic alternative to sidebar — a map-as-chapter between story sections. Rejected in favor of ROADMAP sidebar spec.
- **Floating overlay toggle map:** Map hidden by default, toggled via icon. Rejected.
- **Public viewer** — Phase 5.
- **OG meta tags** — Phase 5.
