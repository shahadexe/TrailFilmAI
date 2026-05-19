---
plan: 05-01
phase: 05-sharing-deploy
status: complete
completed: "2026-05-19"
---

## Summary

Added Supabase RLS policy allowing unauthenticated (anon key) reads on the `trips` table for rows where `is_public = true`.

## What Was Built

- New SELECT policy on `public.trips`: `"Public trips are viewable by anyone"` with `USING (is_public = true)`
- Existing owner policy (`auth.uid() = user_id`) left untouched

## Verification

- Supabase Dashboard → Authentication → Policies → trips table shows 2 SELECT policies
- Owner policy: unchanged (`auth.uid() = user_id`)
- New public policy: `(is_public = true)`
- Human confirmed both policies present

## Key Files

None — Supabase Dashboard change only, no code files modified.

## Self-Check: PASSED
