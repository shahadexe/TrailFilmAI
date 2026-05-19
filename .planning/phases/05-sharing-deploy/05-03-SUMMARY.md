---
plan: 05-03
phase: 05-sharing-deploy
status: complete
completed: "2026-05-19"
---

## Summary

Created the visibility toggle system for authenticated trip owners: POST API route, TripDetailHeader UI extensions, and login page private-trip notice.

## What Was Built

### Task 1: POST /api/trips/[id]/visibility (Edge API route)
- `src/app/api/trips/[id]/visibility/route.ts` — Edge API route (`runtime = 'edge'`)
- UUID_PATTERN validation on tripId param (400 on invalid)
- JSON body parse with is_public boolean type guard (400 on invalid)
- `supabase.auth.getUser()` auth check (401 on unauthenticated)
- Ownership check via `.eq('user_id', user.id)` (404 on non-owned)
- `UPDATE trips SET is_public` with error handling (500 on DB error)
- Returns `{ success: true, is_public }` on success

### Task 2: TripDetailHeader + login page
- `src/components/trip/TripDetailHeader.tsx` — extended with:
  - `isPublic` state (initialized from `trip.is_public`), optimistic toggle
  - `handleVisibilityToggle` — optimistic update + API call + revert on error
  - `handleCopy` — clipboard write + 2s "Copied" state
  - AnimatePresence text morph on copy button (idle ↔ copied)
  - `aria-live="polite"` sr-only region for copy confirmation
  - Visibility toggle menu item (completed trips only)
  - Copy link ghost button (visible when isPublic)
  - `visibilityError` display below header actions
- `src/app/(auth)/login/page.tsx` — added `searchParams` prop; inline amber-tinted notice when `?message=private`

## Key Files

- `src/app/api/trips/[id]/visibility/route.ts` (new)
- `src/components/trip/TripDetailHeader.tsx` (modified)
- `src/app/(auth)/login/page.tsx` (modified)

## Verification

- `npm run build` exits 0 (TypeScript clean, route resolves)
- All acceptance criteria met per plan spec

## Self-Check: PASSED
