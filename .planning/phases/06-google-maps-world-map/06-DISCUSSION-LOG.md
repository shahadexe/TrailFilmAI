# Phase 6: Google Maps Migration & World Map Component — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 06-google-maps-world-map
**Areas discussed:** Google Maps library choice, Map dark style strategy, World map component build, API key & env var setup

---

## Google Maps Library Choice

| Option | Description | Selected |
|--------|-------------|----------|
| @vis.gl/react-google-maps | Official Google library, actively maintained, full TypeScript, works with Next.js App Router | ✓ |
| @react-google-maps/api | Widely used, more Stack Overflow answers, but aging and not Google-official | |
| Raw Maps JS API (no wrapper) | Maximum control, no abstraction — closest to current mapbox-gl imperative style | |

**User's choice:** @vis.gl/react-google-maps
**Notes:** Both key behaviors carry over — flyTo (→ panTo+setZoom) and click-to-place pin mode. Dashed amber Polyline using SVG icon pattern preserves the archival/editorial visual from Mapbox.

### Follow-up Q1: Viewer behaviors
| Option | Description | Selected |
|--------|-------------|----------|
| Keep both flyTo and pin placement | flyTo → panTo/setZoom; click-to-place → Google Maps onClick LatLng | ✓ |
| Keep flyTo, drop pin placement | Simpler, more cinematic | |
| You decide | Claude picks | |

### Follow-up Q2: Path style
| Option | Description | Selected |
|--------|-------------|----------|
| Dashed amber Polyline | SVG icon pattern for dashes — same editorial feel | ✓ |
| Solid amber Polyline | Simpler, loses archival feel | |
| You decide | Claude picks | |

---

## Map Dark Style Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Custom JSON styles array | Full control, Claude writes inline JSON | |
| Snazzy Maps / third-party preset | Quick, requires attribution | |
| Google Maps built-in night/dark mode | colorScheme: DARK — zero JSON, less control | ✓ |

**User's choice:** Google Maps built-in night/dark mode
**Notes:** Simpler to maintain. Strip default UI chrome (street view, map type controls) to keep viewer minimal.

### Follow-up Q: Interactivity
| Option | Description | Selected |
|--------|-------------|----------|
| Interactive — pan + zoom enabled | Matches current Mapbox behavior | ✓ |
| Locked — auto-follow only | More cinematic, user loses free exploration | |
| You decide | Claude picks | |

---

## World Map Component Build

| Option | Description | Selected |
|--------|-------------|----------|
| Build from scratch matching Aceternity (D3 geo projections) | pnpm add d3-geo; accurate arc curves | ✓ |
| Simplified hand-coded (no D3) | Pure SVG paths, straight lines instead of arcs | |
| Install from Aceternity UI directly | Manual integration still needed | |

**User's choice:** Build from scratch with D3 geo projections

### Follow-up Q1: Dots / copy
| Option | Description | Selected |
|--------|-------------|----------|
| Adapt to Trailfilm — journey pin locations + cinematic copy | Connect Iceland/Mongolia/Morocco/etc. arcs; "Journeys archived across the world." | ✓ |
| Use WorldMapDemo exactly | "Remote Connectivity" copy verbatim | |
| You decide on dots | Claude picks arcs | |

### Follow-up Q2: Replacement scope
| Option | Description | Selected |
|--------|-------------|----------|
| Replace WorldMapSection entirely | Delete old SVG, JourneyPin, WORLD_PATHS, journeyPins | ✓ |
| Keep existing section structure, swap only the map visual | More surgical | |

---

## API Key & Env Var Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Document HTTP referrer restriction step | Plan includes human-action step to restrict key to trailfilm.vercel.app + localhost | ✓ |
| Skip — unrestricted key for now | Faster, slight abuse risk | |

**User's choice:** Document the restriction setup step

### Follow-up Q: mapbox-gl cleanup
| Option | Description | Selected |
|--------|-------------|----------|
| Remove mapbox-gl completely | Delete mapbox-gl, @types/mapbox-gl, NEXT_PUBLIC_MAPBOX_TOKEN | ✓ |
| Keep mapbox-gl but unused | Adds ~300KB dead weight | |

---

## Claude's Discretion

- Arc pair selection for WorldMap dots (which of the 12 journey locations to connect)
- Adapted section headline letter-animation copy (cinematic Trailfilm voice, not "Remote Connectivity")
- Exact zoom level and animation duration for flyTo equivalent
- Google Maps marker style closest to current 8px amber dots

## Deferred Ideas

None — discussion stayed within phase scope.
