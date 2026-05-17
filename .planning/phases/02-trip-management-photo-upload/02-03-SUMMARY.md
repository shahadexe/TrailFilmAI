---
phase: 02-trip-management-photo-upload
plan: "03"
subsystem: trip-creation-wizard
tags:
  - wizard
  - trip-creation
  - zustand
  - framer-motion
  - react-hook-form
  - zod
  - step-1
  - rsc
dependency_graph:
  requires:
    - 02-01  # useTripCreationStore + createTrip from Plan 01
    - 02-02  # (app)/layout.tsx auth guard + AppNav
  provides:
    - /new route (RSC shell)
    - TripWizard component (AnimatePresence orchestrator with Plan 04 seam)
    - TripDetailsForm component (Step 1 — zod + react-hook-form + createTrip)
    - StepIndicator component
  affects:
    - 02-04  # Plan 04 will swap data-step-2-placeholder with <PhotoUploadStep />
tech_stack:
  added:
    - react-hook-form (first use in codebase — zodResolver wiring)
    - zod v4 schema at module scope (TripDetailsSchema)
  patterns:
    - AnimatePresence mode="wait" for step transitions (mirrors MagicLinkForm idiom)
    - useReducedMotion() gating all Framer Motion transitions
    - useTripCreationStore.getState() for non-React store access in form defaultValues
    - RSC defense-in-depth auth (page + layout both call supabase.auth.getUser())
key_files:
  created:
    - src/components/upload/StepIndicator.tsx
    - src/components/upload/TripWizard.tsx
    - src/components/upload/TripDetailsForm.tsx
    - src/app/(app)/new/page.tsx
  modified: []
decisions:
  - "TripDetailsForm uses raw <input> elements with brand-styled className (not shadcn Input) — consistent with MagicLinkForm.tsx idiom; avoids class override complexity"
  - "Zod schema defined at module scope (outside component) to prevent recreation on every render"
  - "useTripCreationStore.getState() used for defaultValues to avoid hook-call restrictions at initialization time"
  - "TripWizard stub (Task 1 commit) replaced by full TripDetailsForm in Task 2 — single-commit stub avoids tsc failure ordering issue"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-05-17"
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 0
---

# Phase 2 Plan 03: Wizard Shell + Step 1 (Trip Details Form) Summary

One-liner: Multi-step wizard at /new with AnimatePresence orchestration, zod-validated Step 1 form calling createTrip, and a data-step-2-placeholder seam for Plan 04.

## What Was Built

### Architecture Overview

The /new wizard is a three-layer architecture:

1. **RSC shell** (`src/app/(app)/new/page.tsx`) — server component, calls `supabase.auth.getUser()` for defense-in-depth auth, passes `userId` as prop to the client component tree. Renders inside `max-w-[480px]` centered container per UI-SPEC §Wizard Shared Container.

2. **TripWizard** (`src/components/upload/TripWizard.tsx`) — `'use client'` orchestrator. Subscribes to `useTripCreationStore` for the current step. Wraps step renders in `<AnimatePresence mode="wait">` for slide transitions. Calls `reset()` on unmount via `useEffect` cleanup. Respects `useReducedMotion()` by zeroing transition durations.

3. **TripDetailsForm** (`src/components/upload/TripDetailsForm.tsx`) — `'use client'` Step 1 form. Owns the full submit flow: zod validation → `createTrip()` → Zustand store update → `setStep(2)` advance.

### TripWizard: AnimatePresence Wiring

```
AnimatePresence mode="wait"
├── step === 1: motion.div key="step1" initial={false}
│   exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: [0.22,1,0.36,1] } }
│   └── <TripDetailsForm userId={userId} />
└── step === 2: motion.div key="step2"
    initial: { opacity: 0, x: 20 }
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.05 } }
    └── <div data-step-2-placeholder ...> ← Plan 04 seam
```

The `initial={false}` on Step 1's `motion.div` prevents re-animation on first mount — Step 1 entrance is handled internally by TripDetailsForm's own stagger, keeping concerns separate.

### TripDetailsForm Contract

**Props:** `{ userId: string }` — userId flows from RSC server-side getUser() to avoid client-side roundtrip.

**Zod Schema (module-scope):**
```typescript
const TripDetailsSchema = z.object({
  title: z.string().trim().min(2, { message: 'A name helps you find this trip later.' }).max(80, { message: 'Keep it short — 80 characters max.' }),
  destination: z.string().trim().max(80, ...).optional().or(z.literal('')),
})
```

**State machine:** `'idle' | 'submitting'` — no `'error'` state since validation errors are handled inline by react-hook-form and network failures show a toast then return to `'idle'`.

**Submit flow:**
1. `setState('submitting')` — button shows Loader2 spinner
2. `createTrip(supabase, { user_id: userId, title, destination: null|string })`
3. On success: `store.setTripTitle()` → `store.setTripDestination()` → `store.setTripId(id)` → `store.setStep(2)` (component unmounts)
4. On error: `toast.error("Couldn't start the trip. Try again.")` → `setState('idle')`

**Framer Motion entrance stagger:**
- Headline: `opacity 0→1, y 20→0, duration 0.8s, delay 0`
- Supporting copy + fields: `opacity 0→1, y 16→0, duration 0.8s, delay 0.15s`
- Button: `opacity 0→1, y 12→0, duration 0.6s, delay 0.3s`

### StepIndicator

Minimal `<p>` with `role="status"` + `aria-live="polite"`. Classes: `font-sans text-xs font-medium uppercase tracking-[0.05em] text-parchment-400`. Text: `` `Step ${step} of 2` `` (string interpolation — never hardcoded).

### The data-step-2-placeholder Seam

The Step 2 `motion.div` contains `<div data-step-2-placeholder>`. Plan 04 will:
1. Grep this attribute to locate the exact swap point in TripWizard.tsx
2. Replace the placeholder div with `<PhotoUploadStep tripId={store.tripId} userId={userId} />`
3. The tripId is already in the Zustand store after Step 1 completes

### Toast vs Inline Error Split

Following the Phase 1 pattern from CONTEXT.md:
- **Inline errors** (structural, validation): title min-length, max-length violations — appear below input with `role="alert"`, border switches to `border-error`
- **Toast errors** (transient, network): `createTrip()` Supabase failure → `sonner` toast "Couldn't start the trip. Try again." — form returns to idle, user can retry

### Security (Threat Model)

- T-02-08: `userId` from RSC `supabase.auth.getUser()`, never from form input — RLS `auth.uid() = user_id` rejects any spoofed values at DB
- T-02-09: Both `(app)/layout.tsx` and `/new/page.tsx` redirect unauthenticated users to `/login`
- T-02-10: Zod min(2)/max(80) client-side; React JSX auto-escapes text on render

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Wizard shell + StepIndicator | `a26337a` | StepIndicator.tsx, TripWizard.tsx, TripDetailsForm.tsx (stub) |
| Task 2: TripDetailsForm full implementation | `801fac9` | TripDetailsForm.tsx |
| Task 3: /new RSC shell | `cede94b` | src/app/(app)/new/page.tsx |

## Deviations from Plan

None — plan executed exactly as written. The stub-then-replace approach for TripDetailsForm (Task 1 stub → Task 2 full) was explicitly documented in the plan's `<action>` note and followed as specified.

## Known Stubs

- `data-step-2-placeholder` div in TripWizard.tsx: intentional seam for Plan 04. The placeholder text "Step 2 (photo upload) ships in Plan 04." will be replaced by `<PhotoUploadStep />`. This is a planned seam, not an accidental stub — it does not prevent Plan 03's goal (TRIP-01: create a trip row and advance to Step 2 placeholder).

## Threat Flags

None — no new network endpoints, auth paths, or schema changes beyond what the plan's threat model already covers.

## Self-Check: PASSED

Files exist:
- src/components/upload/StepIndicator.tsx: FOUND
- src/components/upload/TripWizard.tsx: FOUND
- src/components/upload/TripDetailsForm.tsx: FOUND
- src/app/(app)/new/page.tsx: FOUND

Commits exist:
- a26337a: FOUND
- 801fac9: FOUND
- cede94b: FOUND

pnpm exec tsc --noEmit: PASSED (exit 0)
pnpm build: PASSED (exit 0, /new route compiled)
