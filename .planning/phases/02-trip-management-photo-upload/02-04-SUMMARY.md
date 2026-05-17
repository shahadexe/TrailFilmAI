---
phase: 02-trip-management-photo-upload
plan: "04"
subsystem: upload
status: complete
tags:
  - upload
  - exif
  - compression
  - supabase-storage
  - state-machine
  - framer-motion
  - step-2
dependency_graph:
  requires:
    - 02-01 (exif.ts, compress.ts, mutations.ts — Plan 01 contracts)
    - 02-03 (TripWizard placeholder, trip-creation store — Plan 03)
  provides:
    - PhotoUploadStep (Step 2 of /new wizard — complete upload pipeline)
    - PhotoProgressRing (SVG progress ring primitive)
    - PhotoDropzone (drag/drop + click-to-pick dropzone)
    - PhotoUploadGrid + PhotoItem/PhotoUploadState types (upload grid with state machine overlays)
    - useUploadPipeline hook (EXIF → compress → storage → insert → cover orchestration)
  affects:
    - src/components/upload/TripWizard.tsx (step===2 slot wired)
    - /new page (Step 2 now functional)
tech_stack:
  added: []
  patterns:
    - Promise.allSettled for parallel upload with partial-success semantics
    - 4-state progress ring (queued=0, compressing=25, uploading=75, success=100) — no byte-level callback available from Supabase JS storage
    - EXIF extracted BEFORE compression (RESEARCH Pitfall 1 — browser-image-compression strips EXIF)
    - Object URL discipline: createObjectURL on accept, revokeObjectURL on remove and unmount
    - Per-photo state machine (queued→compressing→uploading→success|failed_retry|failed_permanent)
    - retryCount 0|1 guard — exactly one manual retry per photo (D-13)
    - Auto-redirect via router.push (not replace) after 350ms once allTerminal && successCount>0 (D-12)
    - updateTripCover called on first successful photo insert per uploadBatch and on each successful retry
key_files:
  created:
    - src/components/upload/PhotoProgressRing.tsx
    - src/components/upload/PhotoDropzone.tsx
    - src/components/upload/PhotoUploadGrid.tsx
    - src/components/upload/useUploadPipeline.ts
    - src/components/upload/PhotoUploadStep.tsx
  modified:
    - src/components/upload/TripWizard.tsx
decisions:
  - "PhotoItem + PhotoUploadState types co-located in PhotoUploadGrid.tsx as canonical source — imported by both useUploadPipeline and PhotoUploadStep"
  - "CTA enabled only when items.length > 0 AND all items have exif !== null (extraction complete) — prevents premature upload before EXIF resolves"
  - "useUploadPipeline receives setItems as prop (ItemUpdater) rather than managing state internally — follows RESEARCH Pattern 5 note that per-photo state belongs in component, not Zustand"
  - "storage path: ${userId}/${tripId}/${crypto.randomUUID()}.${ext} — matches RLS storage policy (Phase 1 folder = auth.uid())"
  - "Defensive fallback in TripWizard when tripId is null: renders error message instead of crashing with non-null assertion"
metrics:
  duration: ~50 minutes
  completed_date: "2026-05-18"
  tasks_completed: 4
  tasks_total: 4
  files_created: 5
  files_modified: 1
---

# Phase 2 Plan 04: Photo Upload Pipeline Summary

**One-liner:** Full photo-upload pipeline (EXIF-first → compress → parallel upload → insert → cover update) with per-photo state machine, SVG progress ring, drag/drop dropzone, and auto-redirect — wired into the TripWizard Step 2 slot.

## Status

All 4 tasks complete. Human verification (Task 4) approved on 2026-05-18 — full end-to-end upload pipeline verified.

## Architecture

### Pipeline Order (strict — RESEARCH Pitfall 1)

```
User drops file
  → URL.createObjectURL(file) [PhotoUploadStep.onFilesAccepted]
  → extractExif(originalFile)  [BEFORE compression — EXIF survives]
  → [user clicks "Begin the story."]
  → compressPhoto(originalFile) [inside uploadOne, state → compressing=25%]
  → supabase.storage.from('trip-photos').upload(storagePath, compressed) [state → uploading=75%]
  → supabase.from('photos').insert({ trip_id, storage_path, latitude, longitude, taken_at, order_index })
  → [if first success] updateTripCover(supabase, tripId, photoId)
  → state → success=100%
```

### Per-Photo State Machine

```
queued (progress=0)
  → compressing (progress=25)
  → uploading (progress=75)
  → success (progress=100)
  → [OR] failed_retry (retryCount=0) → [one manual retry] → success OR failed_permanent
```

### Parallel Upload Strategy

`Promise.allSettled` (not `Promise.all`) — partial successes are preserved. Failed photos surface with a Retry button. After one retry fails, photo becomes `failed_permanent` with a Remove option that drops from local state only (no DB/storage writes — the photo never reached the DB).

### Auto-Redirect (D-12)

```
useEffect: batchStarted && allTerminal && successCount > 0
  → setTimeout(350ms) → router.push(`/trip/${tripId}`)
```

Router.push (not replace) so back button returns to wizard if needed. Redirect fires only when at least one photo succeeded — all-fail keeps user on wizard to see failure UI.

### Cover Photo (D-08)

After the first successful `photos.insert`, `updateTripCover(supabase, tripId, firstSuccessPhotoId)` sets `trips.cover_photo_id`. Idempotent on retry (overwriting with the retry success is acceptable for v1.0).

### Object URL Discipline (RESEARCH Pitfall 4)

- `URL.createObjectURL(file)` called in `onFilesAccepted` when photo is added
- `URL.revokeObjectURL(previewUrl)` called in `onRemove` when photo is removed
- All remaining URLs revoked in the `useEffect` cleanup (component unmount)
- Preview thumbnails use raw `<img>` elements — `next/image` does not support `blob:` URLs (RESEARCH Pitfall 6)

### Storage Path

`${userId}/${tripId}/${crypto.randomUUID()}.${ext}` — matches Phase 1 RLS storage policy `(storage.foldername(name))[1] = auth.uid()::text`. The `ext` is derived from MIME type (`image/jpeg` → `jpg`).

## Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | PhotoProgressRing + PhotoDropzone | 864a162 | PhotoProgressRing.tsx, PhotoDropzone.tsx |
| 2 | PhotoUploadGrid + useUploadPipeline | 925ca1c | PhotoUploadGrid.tsx, useUploadPipeline.ts |
| 3 | PhotoUploadStep + TripWizard | b1b87ee | PhotoUploadStep.tsx, TripWizard.tsx |
| 4 | Human verification — full pipeline approved | (docs) | 02-04-SUMMARY.md |

## Deviations from Plan

None — plan executed exactly as written. All interfaces matched the contracts in the plan's `<interfaces>` block. `pnpm exec tsc --noEmit` and `pnpm build` both exit 0.

## Known Stubs

None — all components have real implementations wired to real Supabase operations.

## Threat Surface Scan

All threats from the plan's `<threat_model>` are mitigated as implemented:

| Threat | Mitigation Applied |
|--------|--------------------|
| T-02-12: MIME filter | ACCEPTED_MIMES constant in PhotoDropzone filters both drag/drop and file picker paths |
| T-02-13: Storage path injection | Path uses server-derived userId + tripId + randomUUID — no user string interpolation |
| T-02-14: DoS via oversized files | compressPhoto enforces maxSizeMB 1.5; bucket 5MB hard limit is Phase 1 |
| T-02-15: 12-photo DoS | MAX_PHOTOS=12 enforced in PhotoDropzone before files enter state |
| T-02-16: EXIF GPS disclosure | Accepted by design (product feature); storage paths use unguessable UUIDs |
| T-02-17: trip_id spoofing | RLS on public.photos enforced by Phase 1 (Phase 1 constraint, not this plan's code) |
| T-02-18: Object URL leak | revokeObjectURL on remove + unmount — implemented |

No new threat surface introduced beyond what the plan's threat model covers.

## Human Verification Results (Task 4 — Approved 2026-05-18)

All verification items passed:

- Full upload pipeline (5-photo happy path): EXIF extracted, photos compressed, uploaded in parallel via Promise.allSettled, rows inserted in public.photos with order_index 0..4, cover_photo_id set on public.trips, URL redirected to /trip/<tripId>.
- MIME filter: PDF/non-image file rejected with exact copy "Only JPEG, PNG, or WebP files are accepted." auto-dismissed after 4s.
- 12-photo cap: Dropping 14 files results in exactly 12 grid cells with cap-exceeded message.
- Failure + Retry flow: Network offline forces failed_retry state (AlertCircle + Retry button). Retry succeeds. Second retry-fail transitions to failed_permanent (XCircle + Remove).
- Remove: Removes cell from local state only — no network call. Object URL revoked.
- All-fail edge case: No router.push fires when successCount === 0.
- Reduced motion: Step transition and thumbnail entrance instant; progress ring stroke-dashoffset still animates (functional feedback per UI-SPEC line 673).

## Self-Check: PASSED

- [x] PhotoProgressRing.tsx created — confirmed
- [x] PhotoDropzone.tsx created — confirmed
- [x] PhotoUploadGrid.tsx created — confirmed
- [x] useUploadPipeline.ts created — confirmed
- [x] PhotoUploadStep.tsx created — confirmed
- [x] TripWizard.tsx modified (PhotoUploadStep imported, step 2 slot wired) — confirmed
- [x] Commits 864a162, 925ca1c, b1b87ee exist — confirmed
- [x] pnpm build compiled successfully — confirmed
- [x] Human verification Task 4: approved
