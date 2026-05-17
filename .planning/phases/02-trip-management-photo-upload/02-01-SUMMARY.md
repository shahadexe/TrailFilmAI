---
phase: 02-trip-management-photo-upload
plan: "01"
subsystem: foundation-utilities
tags:
  - foundation
  - shadcn
  - utilities
  - zustand
  - state
dependency_graph:
  requires:
    - 01-04 (Phase 1 complete — shadcn@2.6.0 style/baseColor/aliases established)
    - src/types/database.ts (Trip, Photo interfaces — cover_photo_id confirmed)
  provides:
    - src/components/ui/skeleton.tsx (Skeleton)
    - src/components/ui/dialog.tsx (Dialog and all Dialog* sub-components)
    - src/components/ui/progress.tsx (Progress)
    - src/lib/utils/exif.ts (extractExif, ExifData)
    - src/lib/utils/compress.ts (compressPhoto)
    - src/lib/utils/format-exif.ts (formatExifTimestamp)
    - src/lib/trips/mutations.ts (createTrip, updateTripCover, deleteTrip)
    - src/stores/trip-creation.ts (useTripCreationStore)
  affects:
    - Plans 02, 03, 04, 06 (all import from these modules)
tech_stack:
  added:
    - "@radix-ui/react-dialog@^1.1.15"
    - "@radix-ui/react-progress@^1.1.8"
  patterns:
    - "Zustand v5 create<T>()() double-call TypeScript idiom"
    - "exifr.parse() with { gps: true, pick: [...] } options"
    - "browser-image-compression with { maxSizeMB: 1.5, maxWidthOrHeight: 2400, useWebWorker: true, initialQuality: 0.85 }"
    - "date-fns format() with 'd MMM yyyy · HH:mm' pattern (U+00B7 middle dot)"
    - "SupabaseClient as parameter (caller chooses browser vs server client)"
    - "delete cascade: storage.remove() first (non-fatal), then trips.delete() (cascade removes photo rows)"
key_files:
  created:
    - src/components/ui/skeleton.tsx
    - src/components/ui/dialog.tsx
    - src/components/ui/progress.tsx
    - src/lib/utils/exif.ts
    - src/lib/utils/compress.ts
    - src/lib/utils/format-exif.ts
    - src/lib/trips/mutations.ts
    - src/stores/trip-creation.ts
  modified:
    - package.json (added @radix-ui/react-dialog, @radix-ui/react-progress)
    - pnpm-lock.yaml
decisions:
  - "OQ-1 resolved: updateTripCover writes cover_photo_id (UUID FK) not cover_photo_url — confirmed against src/types/database.ts Trip interface"
  - "shadcn@2.6.0 used (Phase 1 D-06 pin) — components installed via pnpm dlx shadcn@2.6.0 add"
  - "Per-photo upload state excluded from Zustand store — belongs in component useState (RESEARCH Pattern 5 Note)"
  - "deleteTrip storage errors are logged but not thrown — orphaned storage files preferred over orphaned DB rows (RESEARCH Pattern 9)"
metrics:
  duration: "~12 minutes"
  completed: "2026-05-18"
  tasks: 3
  files: 8
---

# Phase 2 Plan 1: Phase 2 Foundation — shadcn Components, Utility Modules, Zustand Store, Trip Mutation Helpers Summary

**One-liner:** Contracts-first foundation establishing shadcn skeleton/dialog/progress, Build-Guide-verbatim exifr/browser-image-compression utilities, date-fns EXIF formatter, Zustand v5 wizard store, and Supabase trip mutation helpers that all Phase 2 UI plans import.

## What Was Built

### Task 1: shadcn skeleton, dialog, progress components (commit: cb1a29b)

Installed three shadcn UI components at the Phase 1 pinned version (`pnpm dlx shadcn@2.6.0 add skeleton dialog progress`):

- `src/components/ui/skeleton.tsx` — exports `Skeleton` (animate-pulse div wrapper). Used for trip card loading states on the dashboard.
- `src/components/ui/dialog.tsx` — exports `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogClose`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`. Built on `@radix-ui/react-dialog` for accessible focus-trap, aria-modal, Escape-close, and scroll-lock behavior.
- `src/components/ui/progress.tsx` — exports `Progress` (fallback only — primary upload progress is the custom SVG ring in Plan 04). Built on `@radix-ui/react-progress`.

Radix peer deps added to `package.json`: `@radix-ui/react-dialog@^1.1.15`, `@radix-ui/react-progress@^1.1.8`. `components.json` was not modified.

### Task 2: EXIF, compression, and date formatter utility modules (commit: 2370751)

Three pure utility modules created under `src/lib/utils/`:

**`exif.ts`** — Build Guide §10.3 verbatim:
```typescript
export interface ExifData {
  takenAt: Date | null
  latitude: number | null
  longitude: number | null
}

export async function extractExif(file: File): Promise<ExifData>
```
Uses `exifr.parse(file, { gps: true, pick: ['DateTimeOriginal', 'latitude', 'longitude'] })`. Any thrown error returns `{ takenAt: null, latitude: null, longitude: null }` (graceful fallback per RESEARCH Pitfall 1). EXIF is extracted BEFORE compression by design — both functions are independent pure functions; the consumer (Plan 04) chains them in the correct order.

**`compress.ts`** — Build Guide §10.4 verbatim:
```typescript
export async function compressPhoto(file: File): Promise<File>
```
Uses `imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 2400, useWebWorker: true, initialQuality: 0.85 })`. On error: `console.error(...)` and returns the original file — user never loses their photo.

**`format-exif.ts`** — UI-SPEC copywriting contract:
```typescript
export function formatExifTimestamp(date: Date): string
```
Returns `format(date, 'd MMM yyyy · HH:mm')` using the U+00B7 middle dot. Output example: "12 Nov 2024 · 14:32" (24-hour, no AM/PM).

### Task 3: Zustand wizard store and Supabase trip mutation helpers (commit: 83a41d9)

**`src/stores/trip-creation.ts`** — Zustand v5 TypeScript double-call idiom:

```typescript
export const useTripCreationStore = create<TripCreationState>()((set) => ({
  // step: 1 | 2, tripId: string | null, tripTitle: string, tripDestination: string
  // + setStep, setTripId, setTripTitle, setTripDestination, reset
}))
```

- `step` typed as literal union `1 | 2` (not `number`)
- `initialState` const enables clean `reset: () => set(initialState)`
- No per-photo upload state (belongs in component `useState` per RESEARCH Pattern 5 Note)

**`src/lib/trips/mutations.ts`** — Three Supabase helpers accepting `SupabaseClient` as a parameter:

- `createTrip(supabase, { user_id, title, destination })` — `.insert(...).select('id').single()`; trims title; converts empty/whitespace destination to null; throws on error
- `updateTripCover(supabase, tripId, photoId)` — writes `cover_photo_id` (UUID FK, resolves OQ-1; zero occurrences of `cover_photo_url`); throws on error
- `deleteTrip(supabase, tripId, photos)` — calls `storage.from('trip-photos').remove([paths])` first (logs storage errors, does not throw); then `from('trips').delete().eq('id', tripId)` (DB FK cascade removes photo rows automatically; throws on error)

## Verification

- `pnpm exec tsc --noEmit` — exits 0, zero errors
- `pnpm build` — exits 0, all 9 pages generated successfully
- All 8 files confirmed on disk via `ls` verification

## Deviations from Plan

None — plan executed exactly as written.

All contracts match Build Guide §10.3, §10.4, UI-SPEC copywriting contract, and RESEARCH patterns verbatim. OQ-1 was pre-resolved in the plan against `src/types/database.ts` (cover_photo_id confirmed).

## Known Stubs

None — this plan ships callable functions and installed components only. No UI rendering or data wiring in scope.

## Threat Flags

No new threat surface beyond what is documented in the plan's threat model (T-02-01 through T-02-04). All mitigations are implemented:
- T-02-01: `createTrip` accepts `user_id` as a parameter from the caller (who must derive it from `supabase.auth.getUser()`); RLS enforces auth.uid() = user_id at DB level
- T-02-02: `updateTripCover` relies on existing RLS policy "Users can update own trips"
- T-02-03: Both `extractExif` and `compressPhoto` wrapped in try/catch with graceful fallbacks
- T-02-04: `deleteTrip` receives `storage_path` values from DB query (RLS-filtered), not from user input

## Self-Check: PASSED

All 8 created files confirmed on disk:
- src/components/ui/skeleton.tsx — FOUND
- src/components/ui/dialog.tsx — FOUND
- src/components/ui/progress.tsx — FOUND
- src/lib/utils/exif.ts — FOUND
- src/lib/utils/compress.ts — FOUND
- src/lib/utils/format-exif.ts — FOUND
- src/lib/trips/mutations.ts — FOUND
- src/stores/trip-creation.ts — FOUND

All 3 task commits confirmed:
- cb1a29b: feat(02-01): install shadcn skeleton, dialog, progress components — FOUND
- 2370751: feat(02-01): create EXIF, compression, and date formatter utility modules — FOUND
- 83a41d9: feat(02-01): create Zustand trip-creation store and Supabase trip mutation helpers — FOUND
