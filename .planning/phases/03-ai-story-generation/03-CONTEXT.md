# Phase 3: AI Story Generation - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users select one of four narrative tones (cinematic, poetic, adventurous, documentary) as Step 3 of the existing `/new` trip creation wizard, then trigger AI story generation. A Next.js API route calls Gemini 2.0 Flash multimodally — passing the trip's uploaded photos as base64 inline data — and receives a structured JSON response with 3-6 story chapters. Each chapter is saved to the `story_chapters` table with its title, narrative prose, and linked photo indices mapped to photo UUIDs. After generation, the user is redirected to `/trip/[id]` which now shows the photo grid (Phase 2) plus a chapter list section below. Existing completed-story trips get a 'Change tone & regenerate' action on the trip detail page.

**In scope:** `/new` wizard extension (Step 3 tone selector + Generate CTA), `/api/generate-story/route.ts` (Edge Runtime, streaming response), `src/lib/gemini/` (client, prompts, generateStory), `story_chapters` DB writes, `trips.generation_status` updates, `/trip/[id]` chapter list section, regeneration flow (tone change dialog + confirmation + re-generation).

**Out of scope:** Cinematic viewer (Phase 4), Mapbox map (Phase 4), public sharing (Phase 5), voice narration, photo reordering for story purposes.

</domain>

<decisions>
## Implementation Decisions

### Generation Approach
- **D-01:** Use **Gemini 2.0 Flash** (`gemini-2.0-flash`) — NOT 1.5 Flash as specified in the Build Guide. 2.0 Flash produces noticeably better stylistic instruction-following and more scene-specific prose quality. Same free tier rate limits (15 RPM / 1500 RPD).
- **D-02:** Photos are delivered to Gemini as **inline base64 data** (fetched server-side from Supabase Storage public URLs) — consistent with Build Guide §9 `generateStory.ts`.
- **D-03:** The API route runs on **Edge Runtime** (`export const runtime = 'edge'`). Edge functions on Vercel Hobby support 30s streaming wall-clock — sufficient for multimodal Gemini calls. Serverless runtime has a hard 10s execution limit which is too short. Note: `Buffer` is not available in Edge; use `btoa()` / `Uint8Array` for base64 encoding.
- **D-04:** API route returns a **streaming response** (ReadableStream / SSE). The client shows a fake animated amber progress bar + rotating status text while the stream is open. Status phases: "Reading your photos…" → "Writing your story…" → "Finishing up…". When the stream closes with the full result, the client navigates to `/trip/[id]`. The stream keeps the connection alive; actual progress data is not streamed incrementally — the full JSON chapters arrive at stream close.
- **D-05:** On Gemini JSON parse failure: **retry once automatically** with the same payload. If the second attempt also fails, surface the inline error state below the Generate button with a "Try again" CTA for the user. Never `window.alert()` or toast for generation failure.
- **D-06:** The Gemini prompt includes the **anti-slop directive**: "Describe only what you actually observe in each photo — specific colors, subjects, moments. Never generalize about a type of place. If you see a chai stall, describe THIS chai stall." This is added in addition to the existing Build Guide §9 anti-cliché rules.

### Wizard Extension (Step 3)
- **D-07:** Extend the Zustand `useTripCreationStore` to support `step: 1 | 2 | 3`. Step 3 is the tone selector + Generate Story button. The wizard shows `StepIndicator` updated to "Step 1 of 3" / "Step 2 of 3" / "Step 3 of 3" — consistent with the Phase 2 StepIndicator pattern.
- **D-08:** Default tone is **cinematic** (matches `story_tone default 'cinematic'` in the DB schema). The cinematic tone card is pre-selected when Step 3 first renders.
- **D-09:** The Generate CTA is amber-filled full-width button. Once clicked: Framer Motion text morph ("Developing your story…") + amber progress bar beneath + rotating status text (D-04). Button is disabled during generation. No navigation away until generation resolves.

### Post-Generation Trip Detail View
- **D-10:** `/trip/[id]` is extended to conditionally show a story section when `generation_status = 'completed'` and chapters exist. The page structure: Phase 2 photo grid (top) → hairline divider + "Your Story" eyebrow label (Inter 11px uppercase `tracking-[0.14em] text-parchment-600`) → chapter list (chapter title in Fraunces + narrative prose in Inter body, per chapter block).
- **D-11:** When `generation_status = 'draft'` (photos uploaded, no story yet), the trip detail page shows a **"Generate your story" amber ghost button CTA** below the photo grid. Clicking it navigates to `/new` Step 3 with the existing `tripId` pre-loaded in the Zustand store (so the user can pick tone and generate without re-entering trip details).
- **D-12:** When `generation_status = 'generating'` (generation is in-flight), the trip detail page shows a subtle loading state in the story section area — skeleton or "Story is being written…" amber label. This handles the edge case where a user opens a new tab mid-generation.

### Regeneration Flow
- **D-13:** On `/trip/[id]` for a completed trip, a **"Change tone & regenerate"** ghost button appears in the `TripDetailHeader` (or near the story section). It opens a shadcn AlertDialog containing the same 2×2 tone selector card grid (consistent with the wizard). Current tone is pre-selected.
- **D-14:** After tone selection in the dialog, a **confirm step** appears: "This will replace your current story. This can't be undone." (Confirm / Cancel) — consistent with the Phase 2 `DeleteTripDialog` pattern. On confirm: delete existing `story_chapters` rows, set `generation_status = 'generating'`, call the same `/api/generate-story` endpoint, update with the new story.
- **D-15:** The regeneration UX during generation matches the wizard generation UX (amber progress bar + status text), rendered inline on the trip detail page below the TripDetailHeader.

### Claude's Discretion
- Exact Framer Motion text morph animation for the Generate button ("Developing your story…" transition in/out).
- Exact chapter block layout and spacing within the story section.
- Whether the "Your Story" section has an amber accent hairline or just a plain divider.
- Exact status text copy for the streaming progress (the three phases are decided; exact wording is Claude's call within the brand voice).
- Whether the "Change tone & regenerate" trigger is a button in the header or a three-dot menu option.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary Build Guide
- `Ideation/02_MVP_BUILD_GUIDE.md` §9 — **The Gemini Prompt** — `buildStoryPrompt()` function, `STORY_TONES` object, tone instructions for all 4 tones. The prompt is the most important file in the codebase. Note: model is overridden to `gemini-2.0-flash` per D-01.
- `Ideation/02_MVP_BUILD_GUIDE.md` §9 — `generateStory.ts` skeleton — photo fetching pattern, `GoogleGenerativeAI` SDK usage. Adapt for Edge Runtime (replace `Buffer.from().toString('base64')` with Web API equivalent per D-03).
- `Ideation/02_MVP_BUILD_GUIDE.md` §8 Phase 5 — AI Story Generation task list — reference for what the API route must do.

### Design System
- `Ideation/03_DESIGN_AND_BRAND.md` — Brand voice and anti-patterns. Critical for all copy: tone descriptor lines, CTA text, error messages.
- `.planning/ROADMAP.md` §Phase 3 UI constraints — Locked UI spec for Phase 3: tone selector card grid (2×2, surface-card, amber selected state), Generate CTA behavior, progress bar, error state, transition to viewer.
- `.planning/phases/02-trip-management-photo-upload/02-UI-SPEC.md` — Typography, color, spacing, motion constants from Phase 2 that Phase 3 must inherit. No new design tokens.

### Requirements
- `.planning/REQUIREMENTS.md` — STORY-01, STORY-02, STORY-03 are Phase 3 acceptance targets.
- `.planning/ROADMAP.md` §Phase 3 success criteria — 4 criteria (tone effect on output, 3-6 chapters, GPS anchoring, tone differentiation).

### Existing Schema (already live)
- `Ideation/02_MVP_BUILD_GUIDE.md` §7 — `story_chapters` table schema (id, trip_id, chapter_index, title, narrative, photo_ids uuid[], location_name). `trips.generation_status` check constraint ('draft', 'generating', 'completed', 'failed'). `trips.story_tone` check constraint (all 4 tone values).

### Existing Code (reuse/extend)
- `src/stores/trip-creation.ts` — Zustand store for wizard. Extend `step: 1 | 2` to `step: 1 | 2 | 3`, add `selectedTone: StoryTone` field.
- `src/types/database.ts` — `StoryTone`, `GenerationStatus`, `StoryChapter` types already defined.
- `src/components/upload/TripWizard.tsx` — Existing wizard component; Phase 3 adds Step 3 branch.
- `src/components/upload/StepIndicator.tsx` — Already built; update totalSteps from 2 to 3.
- `src/app/(app)/trip/[id]/page.tsx` — Phase 2 trip detail server component; Phase 3 extends it with the story section and CTA.
- `src/components/trip/TripDetailHeader.tsx` — Phase 2 header; Phase 3 adds regeneration trigger.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/server.ts` — Server Supabase client for API route (story_chapters insert, trips update).
- `src/lib/supabase/client.ts` — Browser client for client components (generation status polling if needed).
- `src/components/ui/button.tsx` — shadcn Button (amber primary for Generate CTA; ghost for regenerate trigger).
- `src/components/ui/dialog.tsx` / `alert-dialog.tsx` — shadcn AlertDialog for regeneration confirmation (already installed in Phase 2).
- `src/components/ui/progress.tsx` — `@radix-ui/react-progress` — install and use for the amber generation progress bar.
- `src/types/database.ts` — `StoryTone` and `GenerationStatus` types already defined and match the DB schema.

### Established Patterns
- **Framer Motion AnimatePresence mode="wait":** Phase 1 and 2 use this for state transitions. Apply to wizard Step 2 → Step 3 transition.
- **`useReducedMotion()`:** All Framer Motion animations must be gated. Applies to the text morph, progress bar animation, and chapter list stagger.
- **Inline error below CTA:** Established in Phase 1 (MagicLinkForm) and mandated by ROADMAP for Phase 3. Never use toasts for generation failure.
- **Server components for page-level data:** `/trip/[id]/page.tsx` is an async RSC. Phase 3 fetches `story_chapters` from the DB in the same RSC and passes to client components.
- **Error → toast for transient / inline for structural:** Generation failures = inline. Network flash errors = sonner toast.
- **shadcn AlertDialog for destructive confirms:** Used in Phase 2 for trip deletion. Phase 3 reuses the same pattern for regeneration confirmation.

### Integration Points
- `src/app/(app)/new/page.tsx` → `TripWizard` — Phase 3 adds Step 3 to the wizard.
- `src/app/api/generate-story/route.ts` — New API route (Edge Runtime). Receives `{ tripId, tone }` from client.
- `src/app/(app)/trip/[id]/page.tsx` — Phase 3 adds `story_chapters` fetch + story section render + draft CTA.
- `src/components/trip/TripDetailHeader.tsx` — Phase 3 adds regeneration trigger.
- `src/middleware.ts` — Already protects `/api/*` routes via (app) layout; no changes needed for route auth.

</code_context>

<specifics>
## Specific Ideas

- **Gemini model override:** Use `gemini-2.0-flash` (not `gemini-1.5-flash` from Build Guide §9). The `GoogleGenerativeAI` SDK call is `genAI.getGenerativeModel({ model: 'gemini-2.0-flash', ... })`.
- **Edge Runtime base64 encoding:** Replace `Buffer.from(buffer).toString('base64')` with: `btoa(String.fromCharCode(...new Uint8Array(await res.arrayBuffer())))` or `btoa([...new Uint8Array(buffer)].map(b => String.fromCharCode(b)).join(''))`. Researcher should verify the correct approach and whether `@google/generative-ai` npm package is Edge-compatible.
- **Streaming response shape:** Client-side code sends POST to `/api/generate-story`. The route streams back as the connection stays open. When complete, the final chunk contains the full parsed chapters JSON (or an error). Client on successful parse: save to state, navigate to `/trip/[id]`.
- **Anti-slop prompt addition:** Add to the prompt's OUTPUT RULES (§9): "9. Describe only what you actually observe in each photo — specific colors, subjects, moments. Never generalize about a type of place or write as if you haven't seen the image."
- **Chapter-to-photo mapping:** Gemini returns `photoIndices: number[]` (1-indexed). Map `photoIndex - 1` to `photos[index].id` (UUID) before writing `photo_ids uuid[]` to `story_chapters`. Store the first photo's GPS as the chapter's `location_name` if available (from the `photos` table latitude/longitude).
- **`generation_status` lifecycle:** draft → generating (set on API route start) → completed (on successful save) → failed (on permanent error). Client polls or the redirect handles the completed case. The 'generating' state edge case (D-12) shows a skeleton on `/trip/[id]`.
- **Brand copy for tones (from ROADMAP):**
  - Cinematic: "Cinematic" / "Like a Nat Geo documentary"
  - Poetic: "Poetic" / "Lyrical and reflective"
  - Adventurous: "Adventurous" / "Bold and energetic"
  - Documentary: "Documentary" / "Observational and grounded"

</specifics>

<deferred>
## Deferred Ideas

- Cinematic scroll-driven story viewer — Phase 4 (replaces the Phase 3 chapter list on `/trip/[id]`)
- Mapbox animated map tracing the journey — Phase 4
- Public trip toggle + shareable URL — Phase 5
- Streaming token-by-token chapter text reveal — post-MVP (complex incremental JSON parsing; decided against in D-04)
- Hindi/regional language generation — Phase 3+ (out of scope for v1.0)
- Story quality iteration / prompt A/B testing — post-MVP

</deferred>

---

*Phase: 3-ai-story-generation*
*Context gathered: 2026-05-19*
