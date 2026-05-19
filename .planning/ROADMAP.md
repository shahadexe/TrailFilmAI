# Trailfilm AI — v1.0 Roadmap

**Milestone:** v1.0 Trailfilm MVP
**Total phases:** 5
**Requirements mapped:** 17/17

## Phase Summary

| # | Phase | Goal | Requirements | Criteria |
|---|-------|------|--------------|----------|
| 1 | Foundation & Auth | Project is scaffolded and users can authenticate via magic link | AUTH-01, AUTH-02, AUTH-03 | 4 |
| 2 | Trip Management & Photo Upload | 6/6 | Complete |  |
| 3 | AI Story Generation | App transforms uploaded photos into a structured, tone-driven narrative | STORY-01, STORY-02, STORY-03 | 4 |
| 4 | Cinematic Viewer | 3/3 | Complete — Human Verified | 2026-05-19 |
| 5 | Sharing & Deploy | Trips are shareable via public URL and the app is live on Vercel | SHARE-01, SHARE-02 | 3 |

---

## Design System & UI Constraints

> All phases with `UI hint: yes` must build to this system. Nothing ships that conflicts with these constraints. Phase 4 (Cinematic Viewer) is the full expression — all earlier phases are set-dressing for it.

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `ink` / `bg-ink` | `#0A0A0A` | Canvas background — all pages |
| `ink-800` | `#161616` | Card surfaces, input backgrounds |
| `ink-700` | `#1F1F1F` | Elevated surfaces, fallback covers |
| `ink-50` | `#FAFAF7` | Primary text |
| `parchment-200` | `#E8E6DF` | Secondary text, body copy |
| `parchment-400` | `#B5B2A8` | Subdued labels, captions |
| `parchment-600` | `#6B6862` | Muted labels, divider text |
| `amber-accent` | `#E5A663` | Single accent — CTAs, active states, glows |
| `amber-bright` | `#FFC881` | Button hover |
| `amber-deep` | `#B07F40` | Button active/pressed |
| `error` | `#D67867` | Inline errors only |
| `success` | `#5DBB7D` | Upload success badges |

**Rules:** One accent color. Never introduce a second accent. All grays are warm-tinted; never mix cool grays into the palette.

---

### Typography

| Role | Font | Weights | Notes |
|------|------|---------|-------|
| Display / headlines | Fraunces (serif) | 400, 500, 600 | `h1`–`h3` auto-apply via `@layer base` |
| Body / UI | Inter (sans) | 400, 500, 600 | All labels, buttons, captions |

**Tracking conventions:**
- Large display (wordmark, hero h1): `tracking-[-0.02em]` — tight, commanding
- Uppercase labels / eyebrows: `tracking-[0.14em]` – `tracking-[0.18em]` — airy, cinematic
- Uppercase wordmark: `tracking-[0.04em]` — moderate expansion
- Body text: default; max line-length ~65ch

**Size scale (key breakpoints):**
- Hero h1: `clamp(60px, 13vw, 120px)` (marketing), `38px / 56px` (dashboard)
- Section h2: `28px / 36px`
- Card title: `17px / 18px`
- Label / caption: `11–13px`

---

### Atmospheric Layer Stack

Every full-screen surface builds in this exact z-order (bottom → top):

```
z-0  Canvas          bg-ink (#0A0A0A)
z-0  Bokeh orbs      floating amber blobs, filter:blur, opacity 0.03–0.06
z-0  Ambient glow    .ambient-glow — radial amber, animation: glow-breathe 12s
z-20 Content         all interactive and visible elements
z-10 Grain overlay   .grain-overlay, fixed, pointer-events-none, opacity-[0.03]
```

**Bokeh orb spec:** `radial-gradient(circle, rgba(229,166,99,1) 0%, transparent 68%)`, `filter: blur(40–90px)`, `animation: float-bokeh {12–21}s ease-in-out infinite`, varied delays. Never use hard-edged shapes.

**Glow rules:** The ambient glow breathes (`glow-breathe` keyframe, 12s). On auth/marketing full-screen pages, add 2–3 offset secondary bokeh orbs for depth. On app interior pages (dashboard, viewer), keep a single centered ambient glow — the content is the focus.

---

### Motion Principles

**Custom easing** — always use `ease-trailfilm: cubic-bezier(0.22, 1, 0.36, 1)` for all transitions. This is the brand motion signature.

**Duration scale:**

| Type | Duration | Notes |
|------|----------|-------|
| Micro-interaction (hover, active) | 200–300ms | Color, opacity, scale |
| Component transition | 400–500ms | Card lift, border glow |
| Page / entry animation | 700–1000ms | Full stagger sequences |
| Marketing / cinematic | Up to 1200ms | Decorative only |

**Entry pattern (standard):**
```
initial: { opacity: 0, y: 20–32 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.8–1.0, ease: [0.22, 1, 0.36, 1] }
```

**Stagger children:** `staggerChildren: 0.08–0.12s`, `delayChildren: 0.05s`

**Rules:**
- Gate every Framer Motion animation on `useReducedMotion()` — pass `{ duration: 0 }` when true
- Never animate from `scale(0)` — start from `scale(0.95)` minimum
- Only animate `transform` and `opacity` — never `width`, `height`, or layout properties
- Active/press feedback: `scale(0.97–0.98)` on all clickable elements
- CSS keyframe animations (bokeh, glow) use `@media (prefers-reduced-motion: reduce)` guards in globals.css

---

### Component Patterns

**Glass card** (`.surface-card`):
- `background: #0D0D0D`, `border: 1px solid rgba(255,255,255,0.06)`
- Inner top glow: 1px hairline `linear-gradient(90deg, transparent, rgba(229,166,99,0.22), transparent)`
- Drop shadow: `0 32px 64px -16px rgba(0,0,0,0.6), 0 0 80px rgba(229,166,99,0.04)`
- Entrance: `.card-enter` CSS animation (scale 0.95→1 + translateY 20→0, 0.9s)

**Primary CTA button** (amber filled):
- `bg-amber-accent text-ink rounded-xl`
- Hover: `bg-[#FFC881]`, `translateY(-0.5)`, `shadow-[0_8px_24px_-6px_rgba(229,166,99,0.4)]`
- Active: `scale(0.98)`, `bg-[#B07F40]`
- Disabled: `opacity-40 cursor-not-allowed`

**Ghost / secondary button:**
- `border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]`
- Hover: `border-[rgba(229,166,99,0.4)]`, `bg-[rgba(229,166,99,0.08)]`, `text-amber-accent`, amber shadow glow
- Same active: `scale(0.97)`

**Text input:**
- `bg-[#0D0D0D] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3`
- Focus: `ring-2 ring-amber-accent/35 border-amber-accent/55 shadow-[0_0_0_4px_rgba(229,166,99,0.07),0_0_20px_-8px_rgba(229,166,99,0.2)]`
- Error: `border-error/60`

**Navigation:**
- Sticky, `bg-ink/80 backdrop-blur-xl`, `border-b border-[rgba(255,255,255,0.05)]`
- Centered amber gradient hairline at bottom (`.nav-accent-line`)
- Wordmark: Fraunces uppercase, hover expands `letter-spacing` (cinematic tension)

**Trip card:**
- Portrait `aspect-[3/4]`, `rounded-xl`, `.gradient-fade-bottom` cinematic overlay
- Hover: `y: -5`, `borderColor: rgba(229,166,99,0.3)`, warm amber tinted `box-shadow`
- Radial amber glow from text zone on hover, image scales to 1.07
- Title: Fraunces 17–18px over gradient

**Step indicator:**
- Numbered amber circles (5×5, `rounded-full`): idle → amber fill active → checkmark done
- Active circle: `shadow-[0_0_12px_rgba(229,166,99,0.5)]`
- Segment bar: 10×0.5 pill, amber fill + `step-bar-glow` on active

---

### What Is Off-Limits

- No pure `#000000` black backgrounds — always `#0A0A0A` or darker warm off-black
- No second accent color — `#E5A663` amber is the only hue; supporting palette is neutrals only
- No purple/blue AI-default gradient aesthetic
- No generic `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` — all shadows are dark-tinted and warm
- No `transition: all` — always specify exact properties
- No `ease-in` on UI animations — always `ease-out` or `ease-trailfilm`
- No animations on keyboard-triggered actions (command palette, shortcuts)
- No lorem ipsum — all copy must match the cinematic/archival brand voice
- No emojis as UI icons — Lucide only, consistent stroke weight

---

## Phase 1: Foundation & Auth

**Goal:** The project skeleton is production-ready and users can sign up and log in with a magic link email — no password required.
**Requirements:** AUTH-01, AUTH-02, AUTH-03
**UI hint:** yes — atmospheric full-screen gateway
**Dependencies:** none

**UI constraints:**
- Full-screen `bg-ink` canvas with grain overlay + breathing ambient glow + 2–3 offset bokeh orbs
- Auth card: `.surface-card .card-enter` (CSS scale+translate entrance, 0.9s), premium shadow, top/bottom amber hairlines
- Fraunces headline "Enter your email." / "Check your inbox." — 28px mobile, 40px desktop
- MagicLinkForm: amber-filled CTA, focus glow on email input, inline error state (no toasts for validation)
- Google OAuth button: ghost button pattern with Google SVG logo (4-color official paths)
- Divider: `rgba(255,255,255,0.06)` hairlines + `text-parchment-600` "or" label
- Confirmation view: `CheckCircle2` amber icon springs in (`type: spring, stiffness: 200, damping: 20`)

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
**UI hint:** yes — app interior; atmospheric but content-forward
**Dependencies:** Phase 1

**UI constraints:**
- **AppNav:** sticky, `bg-ink/80 backdrop-blur-xl`, amber gradient hairline at bottom center, wordmark expands letter-spacing on hover
- **Dashboard:** `DashboardHeader` client component — staggered Framer Motion entrance (count fades, h1 sweeps up). h1: Fraunces 38px/56px, `tracking-[-0.02em]`
- **Trip card grid:** 2-col mobile → 3-col desktop, `gap-3/4/5`. Cards: portrait `aspect-[3/4]`, warm amber tinted shadow + radial glow on hover, image scales 1.07, `y: -5`
- **Empty state:** centered illustration (film frame + animated map pin), Fraunces headline, amber-filled CTA button
- **Skeletons:** `.skeleton-shimmer` shimmer animation matching card aspect ratio — never spinner
- **Trip wizard:** `StepIndicator` with numbered amber circles + glow bars; Fraunces headline per step; amber focus-glow inputs
- **Dropzone:** dashed border, amber border + concentric ring pulse (`expand-ring` keyframe) on drag-over; icons from Lucide `Images`
- **Upload grid:** 3-col (`sm:4-col`), square thumbnails, per-photo `PhotoProgressRing`, success badge, retry strip

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

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 02-04-PLAN.md — Photo upload pipeline (Step 2): dropzone, state machine, parallel upload, auto-redirect
- [x] 02-05-PLAN.md — Trip detail page: photo grid with EXIF badges
- [x] 02-06-PLAN.md — Trip deletion with storage cleanup

---

## Phase 3: AI Story Generation

**Goal:** Users select a narrative tone and the app calls Gemini 2.5 Flash (per D-01) to produce a structured 3-6 chapter story where each chapter is anchored to a photo and GPS location.
**Requirements:** STORY-01, STORY-02, STORY-03
**UI hint:** yes — tone selector and generation progress
**Dependencies:** Phase 2

**UI constraints:**
- **Tone selector:** 4 `.surface-card` option cards in a 2×2 grid — Cinematic, Poetic, Adventurous, Documentary. Selected card: `border-amber-accent/40 bg-[rgba(229,166,99,0.04)]` with amber label. Hover: ghost button treatment
- **Tone labels:** Fraunces medium for tone name, Inter small for 1-line descriptor
- **Generate CTA:** amber-filled full-width button. Once clicked: inline loading state with Framer Motion text morph ("Developing your story…") + `Loader2` spinner. Never navigate away mid-generation
- **Generation progress:** subtle amber progress bar beneath the button (not a modal). CSS `@keyframes progress-indeterminate` (off main thread) per UI-SPEC — NOT `@radix-ui/react-progress` (would jank during Gemini call)
- **Error state:** inline error below the button — never `window.alert()` or toast for generation failure. Give the user a retry path
- **Transition to viewer:** once generation completes, navigate with a cinematic fade (opacity 0→1 on the viewer page)

**Success criteria:**
1. A user chooses one of four tones (cinematic, poetic, adventurous, documentary) before generating a story — the selection is reflected in the output's voice and register.
2. After triggering generation, the app returns a story with between 3 and 6 distinct chapters within the Gemini free-tier rate limits.
3. Every chapter is associated with exactly one photo and one GPS coordinate from the trip's uploaded photos.
4. A story generated for the same trip with a different tone produces noticeably different prose — the tone selector has real effect.

**Plans:** 5 plans

Plans:
**Wave 1** *(parallel — disjoint files)*
- [ ] 03-01-PLAN.md — Gemini library (client, prompts with D-06 anti-slop, generateStory with Edge-safe btoa loop + gemini-2.5-flash)
- [ ] 03-02-PLAN.md — Zustand store extension (step 1|2|3 + selectedTone), StepIndicator → "Step X of 3", globals.css `.progress-indeterminate` keyframe + reduced-motion guard

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 03-03-PLAN.md — Edge API route `/api/generate-story` + Wizard Step 3 (ToneSelector + ToneStep + GenerationProgress + AnimatePresence text morph) + TripWizard step 3 branch + /new resume params (D-11)

**Wave 3** *(parallel — blocked on Wave 2 completion)*
- [ ] 03-04-PLAN.md — Trip detail story section: RSC `story_chapters` fetch + StorySection + StoryChapterBlock (useInView scroll entrance) + DraftStoryCTA (D-11) + GeneratingStoryState (D-12)
- [ ] 03-05-PLAN.md — Regeneration flow: TripDetailHeader 3-dot menu + RegenerationDialog (2-step Dialog: tone select → confirm → API call → router.refresh) + end-of-phase verification (26 checks)

---

## Phase 4: Cinematic Viewer

**Goal:** Users experience their generated story as a full-screen, scroll-driven cinematic presentation with photo parallax, animated chapter narrative, and a Mapbox map that traces the journey.
**Requirements:** VIEW-01, VIEW-02, VIEW-03
**UI hint:** yes — the peak experience; everything else leads here
**Dependencies:** Phase 3

**UI constraints:**
- **Canvas:** full-bleed `bg-ink`, no nav chrome (or a ghost/floating nav that fades on scroll). Grain overlay fixed + ambient glow on opening chapter
- **Chapter sections:** `min-height: 100dvh` (never `100vh` — iOS Safari viewport bug). Each chapter = full-screen section
- **Photo backdrop:** `object-cover` fill, `.gradient-fade-bottom` overlay. Parallax on scroll via `transform: translateY()` (GPU-accelerated, not `top`). Cover scales subtly on scroll entry (1.0 → 1.04)
- **Chapter narrative text:** Fraunces headline (chapter name/title), Inter body (AI prose). Text fades + slides in as chapter enters viewport (`IntersectionObserver` or Framer Motion `useInView({ once: true, margin: "-120px" })`). Stagger each paragraph line
- **Chapter number/eyebrow:** `font-sans text-[11px] uppercase tracking-[0.18em] text-parchment-600` — "Chapter 01", "Chapter 02"
- **Map panel:** Mapbox GL, dark style (`mapbox://styles/mapbox/dark-v11`). Path drawn with amber `#E5A663` line. Markers: small amber dots. Map panel either sidebar (desktop) or sticky bottom sheet (mobile)
- **Progress indicator:** thin amber hairline on left edge that fills as user scrolls through story — pure CSS `position: fixed`, `height: 100vh`, animated via scroll-linked JS
- **Transitions between chapters:** parallax fade, not hard cuts. The `.gradient-fade-top` class handles the top fade
- **Typography in viewer:** `text-wrap: balance` on all headline nodes. Body prose: `leading-[1.75]`, `max-w-[62ch]`
- **Responsive:** 375px mobile — map moves below the narrative; text at readable 15–16px base

**Success criteria:**
1. Scrolling through the story viewer reveals each chapter with a parallax photo backdrop and the chapter's AI-written narrative text appearing in motion — no manual navigation required.
2. An animated Mapbox map is visible within the viewer and draws a path connecting the GPS locations of all chapters in chronological order.
3. The viewer renders exclusively in the brand visual system: `#0A0A0A` canvas, `#FAFAF7` body text, `#E5A663` accent, Fraunces for headlines, Inter for body — no off-brand styles.
4. The viewer is fully usable on a 375px viewport without horizontal scroll or broken layout.

**Plans:** 3/3 plans complete

Plans:
**Wave 1** *(parallel — disjoint files)*
- [x] 04-01-PLAN.md — Viewer chrome: ChapterSection (parallax + scroll-linked text fade), ViewerNav (ghost floating nav with scroll-fade), ScrollProgress (left-edge amber hairline)
- [x] 04-02-PLAN.md — Mapbox tier: ViewerMap (dynamic import, dashed amber path, per-chapter flyTo, responsive sidebar/bottom-sheet) + NoGpsState fallback

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 04-03-PLAN.md — Integration: RSC extension with server-side GPS extraction (D-06), AppNav suppression on cinematic route, CinematicViewer client wrapper, human end-to-end verification + npm run build — HUMAN VERIFIED APPROVED 2026-05-19

---

## Phase 5: Sharing & Deploy

**Goal:** Users can make their trip public and share a link that anyone — including unauthenticated visitors — can view, and the app is deployed live on Vercel.
**Requirements:** SHARE-01, SHARE-02
**UI hint:** yes — share surface and public viewer
**Dependencies:** Phase 4

**UI constraints:**
- **Share toggle:** a single toggle in the trip detail or dashboard card options menu. Toggle uses amber accent for the "on" state — not a modal, not a page; inline or slide-over panel
- **Copy-link button:** ghost button pattern; on click, text morphs from "Copy link" → "Copied" (200ms `opacity+scale` transition) then reverts after 2s. Never navigate away
- **Public viewer:** identical to the authenticated cinematic viewer, but with no editing controls. A subtle "Made with Trailfilm" wordmark link in the bottom-right corner — Fraunces, amber-accent on hover, `opacity-40` idle
- **Unauthenticated CTA:** a minimally-intrusive amber text link "Create your own archive →" at the very end of the story — not a banner, not a sticky bar. Fraunces, respectful of the content
- **OG meta tags:** each public trip page must have `og:title`, `og:description`, `og:image` (use the trip cover photo URL). `og:image` dimensions: 1200×630

**Success criteria:**
1. A user toggles their trip to "public" from the dashboard or trip detail — the trip immediately becomes accessible to the outside world.
2. A person who has never used Trailfilm opens the shared URL in a private browser window and sees the full cinematic viewer without being asked to log in.
3. The live Vercel deployment passes a full end-to-end smoke test: sign up → create trip → upload photos → generate story → view cinematic story → share URL → view as anonymous visitor.

**Plans:** 4 plans

Plans:
**Wave 0** *(pre-requisite — Supabase human action)*
- [ ] 05-01-PLAN.md — Supabase RLS policy: allow anon reads on trips WHERE is_public = true

**Wave 1** *(parallel — disjoint files)*
- [ ] 05-02-PLAN.md — Public viewer route group (public)/t/[id], TrailfilmWatermark, ArchiveCTA, CinematicViewer showNav prop, OG meta tags, middleware comment
- [ ] 05-03-PLAN.md — TripDetailHeader visibility toggle + Copy link button, /api/trips/[id]/visibility Edge route, login private-trip message

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 05-04-PLAN.md — Vercel deployment human-action checkpoint + full end-to-end smoke test

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 4/4 | Complete | 2026-05-17 |
| 2. Trip Management & Photo Upload | 6/6 | Complete | 2026-05-18 |
| 3. AI Story Generation | 0/5 | Planned (3 waves) | — |
| 4. Cinematic Viewer | 3/3 | Complete — Human Verified | 2026-05-19 |
| 5. Sharing & Deploy | 0/4 | Planned (3 waves) | — |
