# Trailfilm

## What This Is

Trailfilm is an AI-powered web app that transforms travel photos into cinematic, emotionally narrated travel stories. Users upload photos from their trips and receive a beautifully animated, story-driven journal — complete with AI-written narrative chapters (Gemini 1.5 Flash), an animated map journey (Mapbox), and a scroll-driven cinematic viewer (Framer Motion). Built mobile-first for the Indian market, launching as a web app with PWA potential.

## Core Value

Turn a camera roll into a film — the single "wow" moment when a user sees their own trip rendered as a cinematic, Nat Geo-style story with zero effort on their part.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up and log in via magic link (email, no password)
- [ ] User can create a trip with a name and optional destination
- [ ] User can upload photos via drag-and-drop (batch, with compression and EXIF auto-read)
- [ ] App auto-extracts GPS coordinates and timestamps from photo EXIF data
- [ ] User can select a story tone (cinematic / poetic / adventurous / documentary)
- [ ] App generates a structured AI story (3-6 chapters) via Gemini 1.5 Flash multimodal
- [ ] User sees a cinematic scroll-driven story viewer with photo parallax and animated narrative
- [ ] Animated Mapbox map traces the trip journey between chapter locations
- [ ] User can toggle a trip to public and share it via a unique URL
- [ ] User has a trip dashboard to view and manage all their trips
- [ ] Public trip URLs are viewable without authentication

### Out of Scope (MVP)

- Voice narration -- Phase 2
- Background music -- Phase 2
- Video / MP4 export -- Phase 2
- Collaborative trips -- Phase 2
- Payment / subscription -- Phase 3
- Hindi / regional language generation -- Phase 3
- Native mobile app (React Native / Capacitor) -- Phase 3
- Photobook printing -- Phase 3
- Wedding edition -- Phase 3

## Context

- **Builder:** Shahad -- CS student; building Trailfilm as both a portfolio cornerstone and a potential real product
- **Target users:** Indian urban travelers, 22-35, mobile-first, active on Instagram and WhatsApp; secondary: couples (honeymoon/anniversary), travel content creators
- **Market:** India domestic travel boom; cultural affinity for emotional storytelling; high social sharing behavior makes every output a viral acquisition loop
- **Design north star:** Luxury cinematic product, not SaaS. Feels like opening a Moleskine in a candlelit room. Reference: Linear, Apple product pages, Aman Resorts website
- **Visual system:** Deep black (#0A0A0A) canvas, parchment off-white (#FAFAF7) text, single amber accent (#E5A663). Typography: Fraunces (serif, editorial headlines) + Inter (sans, UI). Motion: slow, weighted, cubic-bezier(0.22, 1, 0.36, 1), 600-1200ms durations
- **Prior exploration:** Four detailed ideation documents created -- Product Vision, MVP Build Guide, Design & Brand Identity, Execution Playbook. All technical and design decisions are pre-researched.

## Constraints

- **Tech Stack (decided):** Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Mapbox GL JS + Supabase (Postgres + Auth + Storage) + Gemini 1.5 Flash + Vercel deployment
- **Budget:** Free-tier only at MVP scale -- Supabase (500MB DB, 1GB storage), Gemini (1500 RPD), Mapbox (50k loads/month), Vercel hobby tier
- **Network:** Design for 4G and prepaid Indian mobile connections -- client-side image compression mandatory before upload (target: <1.5MB per photo)
- **Timeline:** ~Under 10-11 hours, Need to share working model ASAP
- **Photo cap:** Max 12 photos per trip for MVP (Vercel function size and Gemini payload limits)
- **AI output:** Story quality is the product -- prompt engineering in lib/gemini/prompts.ts is the highest-leverage file in the codebase

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Built-in API routes, RSC reduces client JS, Vercel native deployment | -- Pending |
| Supabase | Postgres + Auth + Storage in one place, RLS for security | -- Pending |
| Gemini 1.5 Flash over OpenAI | Free tier better for image-heavy multimodal use case | -- Pending |
| Magic link auth only | Reduces friction; fits cinematic brand restraint | -- Pending |
| No video export in MVP | Scope control; FFmpeg complexity deferred to Phase 2 | -- Pending |
| Mapbox over Google Maps | Cinematic dark style; smooth flyTo; 50k free loads/month | -- Pending |
| Client-side EXIF + compression | Saves storage costs; faster on slow connections | -- Pending |

## Current Milestone: v1.0 Trailfilm MVP

**Goal:** Ship a working web app that transforms travel photos into a cinematic, AI-narrated story — from upload to shareable public URL.

**Target features:**
- Magic link auth (sign up + log in, no password)
- Trip creation (name + optional destination)
- Photo upload (drag-and-drop, batch, EXIF auto-read, client-side compression)
- AI story generation via Gemini 1.5 Flash (3-6 chapters, 4 tone options)
- Cinematic scroll-driven story viewer (photo parallax + animated narrative)
- Animated Mapbox map tracing the trip journey between chapter locations
- Trip dashboard (view and manage all trips)
- Public trip sharing (toggle + unique shareable URL)

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check -- still the right priority?
3. Audit Out of Scope -- reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-15 — Milestone v1.0 started*
