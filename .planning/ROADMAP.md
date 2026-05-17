# Trailfilm AI — v1.0 Roadmap

**Milestone:** v1.0 Trailfilm MVP
**Total phases:** 5
**Requirements mapped:** 17/17

## Phase Summary

| # | Phase | Goal | Requirements | Criteria |
|---|-------|------|--------------|----------|
| 1 | Foundation & Auth | Project is scaffolded and users can authenticate via magic link | AUTH-01, AUTH-02, AUTH-03 | 4 |
| 2 | Trip Management & Photo Upload | 4/6 | In Progress|  |
| 3 | AI Story Generation | App transforms uploaded photos into a structured, tone-driven narrative | STORY-01, STORY-02, STORY-03 | 4 |
| 4 | Cinematic Viewer | Users experience their trip as a cinematic, scroll-driven story with map | VIEW-01, VIEW-02, VIEW-03 | 4 |
| 5 | Sharing & Deploy | Trips are shareable via public URL and the app is live on Vercel | SHARE-01, SHARE-02 | 3 |

---

## Phase 1: Foundation & Auth

**Goal:** The project skeleton is production-ready and users can sign up and log in with a magic link email — no password required.
**Requirements:** AUTH-01, AUTH-02, AUTH-03
**UI hint:** yes
**Dependencies:** none

**Success criteria:**
1. A new user enters their email, receives a magic link, clicks it, and lands on the app as an authenticated session.
2. A returning user who clicks a new magic link is recognized and lands on their dashboard without re-registering.
3. An authenticated user's session survives a full page reload — they are not bounced to the login screen.
4. An unauthenticated visitor hitting a protected route is redirected to the login page.

**Plans:** 4 plans

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Scaffold Next.js 14 + Tailwind brand theme + shadcn/ui design system

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — Apply Supabase DB schema, storage bucket, and create browser/server clients

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-03-PLAN.md — Middleware, auth callback, (app) layout guard, and marketing placeholder

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 01-04-PLAN.md — /login + /signup pages with MagicLinkForm (full state machine + e2e auth)

---

## Phase 2: Trip Management & Photo Upload

**Goal:** Authenticated users can create and manage trips, then batch-upload photos that are automatically compressed and stripped of GPS and timestamp metadata.
**Requirements:** TRIP-01, TRIP-02, TRIP-03, UPLOAD-01, UPLOAD-02, UPLOAD-03
**UI hint:** yes
**Dependencies:** Phase 1

**Success criteria:**
1. A user creates a new trip by entering a name (and optionally a destination) — the trip appears immediately on their dashboard.
2. A user drags and drops up to 12 photos onto the upload zone; all photos upload successfully in a single batch operation.
3. After upload, each photo's GPS coordinates and capture timestamp are visible in the trip detail view (extracted from EXIF without any user input).
4. Each uploaded photo arrives in Supabase Storage at or under 1.5 MB regardless of original file size.
5. A user deletes a trip from the dashboard — it disappears along with all its photos.

**Plans:** 6 plans

Plans:
**Wave 1**
- [x] 02-01-PLAN.md — Utilities: EXIF extraction, client-side compression, trip mutations
- [x] 02-02-PLAN.md — Trip dashboard: card grid, AppNav, empty state

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02-03-PLAN.md — Trip creation wizard (Step 1): TripDetailsForm, Zustand store, /new route

**Wave 3** *(blocked on Wave 3 completion)*
- [x] 02-04-PLAN.md — Photo upload pipeline (Step 2): dropzone, state machine, parallel upload, auto-redirect
- [ ] 02-05-PLAN.md — Trip detail page: photo grid with EXIF badges
- [ ] 02-06-PLAN.md — Trip deletion with storage cleanup

---

## Phase 3: AI Story Generation

**Goal:** Users select a narrative tone and the app calls Gemini 1.5 Flash to produce a structured 3-6 chapter story where each chapter is anchored to a photo and GPS location.
**Requirements:** STORY-01, STORY-02, STORY-03
**UI hint:** no
**Dependencies:** Phase 2

**Success criteria:**
1. A user chooses one of four tones (cinematic, poetic, adventurous, documentary) before generating a story — the selection is reflected in the output's voice and register.
2. After triggering generation, the app returns a story with between 3 and 6 distinct chapters within the Gemini free-tier rate limits.
3. Every chapter is associated with exactly one photo and one GPS coordinate from the trip's uploaded photos.
4. A story generated for the same trip with a different tone produces noticeably different prose — the tone selector has real effect.

---

## Phase 4: Cinematic Viewer

**Goal:** Users experience their generated story as a full-screen, scroll-driven cinematic presentation with photo parallax, animated chapter narrative, and a Mapbox map that traces the journey.
**Requirements:** VIEW-01, VIEW-02, VIEW-03
**UI hint:** yes
**Dependencies:** Phase 3

**Success criteria:**
1. Scrolling through the story viewer reveals each chapter with a parallax photo backdrop and the chapter's AI-written narrative text appearing in motion — no manual navigation required.
2. An animated Mapbox map is visible within the viewer and draws a path connecting the GPS locations of all chapters in chronological order.
3. The viewer renders exclusively in the brand visual system: #0A0A0A canvas background, #FAFAF7 body text, #E5A663 accent, Fraunces for headlines, Inter for body — with no default or off-brand styles leaking through.
4. The viewer is fully usable on a mobile viewport (375px width) without horizontal scroll or broken layout.

---

## Phase 5: Sharing & Deploy

**Goal:** Users can make their trip public and share a link that anyone — including unauthenticated visitors — can view, and the app is deployed live on Vercel.
**Requirements:** SHARE-01, SHARE-02
**UI hint:** yes
**Dependencies:** Phase 4

**Success criteria:**
1. A user toggles their trip to "public" from the dashboard or trip detail — the trip immediately becomes accessible to the outside world.
2. A person who has never used Trailfilm opens the shared URL in a private browser window and sees the full cinematic viewer without being asked to log in.
3. The live Vercel deployment passes a full end-to-end smoke test: sign up → create trip → upload photos → generate story → view cinematic story → share URL → view as anonymous visitor.

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 4/4 | Complete | 2026-05-17 |
| 2. Trip Management & Photo Upload | 4/6 | In Progress | — |
| 3. AI Story Generation | 0/? | Not started | — |
| 4. Cinematic Viewer | 0/? | Not started | — |
| 5. Sharing & Deploy | 0/? | Not started | — |
