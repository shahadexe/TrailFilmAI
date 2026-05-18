# Phase 3: AI Story Generation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 03-ai-story-generation
**Areas discussed:** Generation approach, Post-generation display, Re-generation

---

## Generation Approach

### How to deliver photos to Gemini within Vercel Hobby constraints

| Option | Description | Selected |
|--------|-------------|----------|
| Stream the response | Edge Runtime + streaming response to keep connection alive (~30s wall-clock on Hobby) | ✓ |
| Cap photos sent to Gemini at 8 | Reduce payload/latency within 10s Node.js limit | |
| Build Guide approach (accept timeout risk) | Fetch all photos as base64, synchronous response | |

**User's choice:** Stream the response

---

### UX during generation

| Option | Description | Selected |
|--------|-------------|----------|
| Progress bar + status text | Fake amber progress bar + rotating status lines | ✓ |
| Real-time chapter text appearing | Token-by-token streaming with incremental JSON parsing | |
| Spinner only | Loader2, no progress indicator | |

**User's choice:** Progress bar + status text ("Reading your photos…" → "Writing your story…" → "Finishing up…")

---

### API route runtime

| Option | Description | Selected |
|--------|-------------|----------|
| Edge Runtime | `export const runtime = 'edge'`, 30s streaming wall-clock, requires Web API base64 encoding | ✓ |
| Node.js Serverless with photo cap | Default runtime, 10s limit, cap at 6-8 photos | |

**User's choice:** Edge Runtime

---

### Malformed JSON / parse failure handling

| Option | Description | Selected |
|--------|-------------|----------|
| Retry once, then inline error | Auto-retry once; if retry fails, show inline error + user retry CTA | ✓ |
| Inline error immediately | No auto-retry; immediate error display | |

**User's choice:** Retry once, then inline error

---

### Gemini model

| Option | Description | Selected |
|--------|-------------|----------|
| gemini-2.0-flash | Newer model, better stylistic instruction-following, same free tier | ✓ |
| gemini-1.5-flash (Build Guide) | Original spec, solid but more generic output | |

**User's choice:** gemini-2.0-flash
**Notes:** User explicitly concerned about "AI slop" / generic output quality. This was the main driver for upgrading the model.

---

### Anti-slop prompt directive

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add it | "Describe only what you actually observe in each photo — specific colors, subjects, moments." | ✓ |
| No, existing prompt is enough | Trust Build Guide §9 anti-cliché rules | |

**User's choice:** Add anti-slop directive
**Notes:** User's exact concern: "I would be needing really good generations, no AI slop, will the current gemini model suffice." Both model upgrade and prompt improvement were agreed as necessary.

---

## Post-generation Display

### What /trip/[id] shows after story is generated

| Option | Description | Selected |
|--------|-------------|----------|
| Chapter list below photos | Photo grid + divider + "Your Story" eyebrow + chapter title + narrative prose blocks | ✓ |
| Chapter titles only | Compact list of titles, no narrative prose shown | |
| Redirect stays on wizard — no /trip/[id] changes | Success state on wizard, no new content on detail page | |

**User's choice:** Chapter list below photos

---

### Section separator between photo grid and story

| Option | Description | Selected |
|--------|-------------|----------|
| Section divider with label | Hairline + "Your Story" eyebrow (Inter 11px uppercase tracking-[0.14em] text-parchment-600) | ✓ |
| You decide | Leave to Claude | |

**User's choice:** Section divider with label

---

### Draft trip (no story yet) — what /trip/[id] shows

| Option | Description | Selected |
|--------|-------------|----------|
| Prompt to generate | "Generate your story" amber ghost button CTA below photo grid | ✓ |
| Just the photo grid — no CTA | Phase 2 page unchanged for draft trips | |

**User's choice:** Prompt to generate CTA

---

## Re-generation

### Can users regenerate with a different tone?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — via trip detail page | "Change tone & regenerate" on /trip/[id]; tone selector dialog | ✓ |
| No — one generation per trip in Phase 3 | Tone locked; new trip required | |
| Yes — only from the wizard | Re-generation only via /new wizard | |

**User's choice:** Yes — via trip detail page

---

### Tone selector in regeneration flow

| Option | Description | Selected |
|--------|-------------|----------|
| Same 4 tone cards as wizard | 2×2 card grid in AlertDialog; current tone pre-selected | ✓ |
| Dropdown select only | Compact shadcn Select, no card grid | |

**User's choice:** Same 4 tone cards as wizard

---

### Confirmation before deleting existing chapters

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — confirm dialog | AlertDialog: "This will replace your current story. This can't be undone." | ✓ |
| No — regenerate immediately on tone select | No confirmation; direct overwrite | |

**User's choice:** Yes — confirm dialog (consistent with Phase 2 DeleteTripDialog pattern)

---

## Claude's Discretion

- Exact Framer Motion text morph animation for the Generate button state change
- Exact chapter block layout and spacing within the story section
- Whether the "Your Story" section has an amber accent hairline or plain divider
- Exact status text copy for streaming progress (phases decided; exact wording is Claude's)
- Whether "Change tone & regenerate" is a button in TripDetailHeader or a three-dot menu option

## Deferred Ideas

- Cinematic scroll-driven story viewer — Phase 4
- Mapbox animated map — Phase 4
- Public trip toggle + shareable URL — Phase 5
- Token-by-token streaming chapter reveal — post-MVP (complex incremental JSON parsing)
- Hindi/regional language generation — out of scope for v1.0
