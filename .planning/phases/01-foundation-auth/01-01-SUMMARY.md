---
phase: "01"
plan: "01"
subsystem: scaffold
tags:
  - nextjs
  - tailwind
  - shadcn
  - greenfield-scaffold
dependency_graph:
  requires: []
  provides:
    - next-js-14-scaffold
    - brand-tailwind-config
    - shadcn-ui-primitives
    - fraunces-inter-fonts
  affects:
    - all-subsequent-plans
tech_stack:
  added:
    - Next.js 14.2.35 (App Router, TypeScript, ESLint, Tailwind, src/ layout)
    - React 18.3.1
    - Tailwind CSS 3.4.19
    - TypeScript 5.9.3
    - shadcn/ui 2.6.0 (Default style, Slate base, CSS variables)
    - tailwindcss-animate 1.0.7
    - "@supabase/supabase-js 2.105.4"
    - "@supabase/ssr 0.10.3"
    - framer-motion 12.38.0
    - mapbox-gl 3.23.1
    - "@google/generative-ai 0.24.1"
    - react-hook-form 7.75.0
    - "@hookform/resolvers 5.2.2"
    - zod 4.4.3
    - zustand 5.0.13
    - lucide-react 1.16.0
    - exifr 7.1.3
    - browser-image-compression 2.0.2
    - clsx 2.1.1
    - tailwind-merge 3.6.0
    - date-fns 4.1.0
    - sonner 2.0.7
    - next-themes 0.4.6
    - class-variance-authority 0.7.1
  patterns:
    - next/font/google for Fraunces + Inter with CSS variable injection
    - shadcn/ui component primitives under src/components/ui/
    - cn() helper via clsx + tailwind-merge in src/lib/utils.ts
    - Brand Tailwind extended color tokens with 60/30/10 distribution
key_files:
  created:
    - package.json
    - pnpm-lock.yaml
    - tsconfig.json
    - next.config.mjs
    - postcss.config.mjs
    - tailwind.config.ts
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - components.json
    - src/lib/utils.ts
    - src/components/ui/button.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - src/components/ui/form.tsx
    - src/components/ui/sonner.tsx
    - .env.example
    - .npmrc
    - pnpm-workspace.yaml
  modified:
    - .gitignore
decisions:
  - "Used shadcn@2.6.0 instead of latest (shadcn@4.7.0) because the latest CLI defaults to base-nova style and neutral base color; version 2.6.0 correctly uses the Default style and Slate base per the plan and UI-SPEC"
  - "Moved Next.js scaffold from trailfilm/ subdirectory to repo root because create-next-app rejects directory names with capital letters (FSApp); all files moved then subdirectory removed"
  - "Brand tailwind.config.ts and globals.css written before shadcn add; shadcn 2.6.0 component add command did not overwrite them"
metrics:
  duration: "~9 hours (overnight run)"
  completed: "2026-05-17"
  tasks_completed: 2
  tasks_total: 3
  files_created: 19
  files_modified: 1
---

# Phase 1 Plan 01: Scaffold + Brand Tailwind + shadcn/ui Summary

One-liner: Next.js 14.2.35 App Router scaffolded with brand ink/amber/parchment Tailwind tokens, Fraunces+Inter via next/font/google, and shadcn/ui (Default/Slate/CSS vars) with 5 Phase 1 primitives.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Scaffold Next.js 14 + install full dependency set | 8249864 | package.json, pnpm-lock.yaml, tsconfig.json, next.config.mjs, src/app/*, tailwind.config.ts, .gitignore, .env.example |
| 2 | Replace Tailwind theme + globals.css + initialize shadcn/ui | eb968b6 | tailwind.config.ts, src/app/globals.css, src/app/layout.tsx, components.json, src/lib/utils.ts, src/components/ui/* |

## Installed Versions

| Package | Version |
|---------|---------|
| next | 14.2.35 |
| react / react-dom | 18.3.1 |
| tailwindcss | 3.4.19 |
| typescript | 5.9.3 |
| tailwindcss-animate | 1.0.7 |
| shadcn CLI used | 2.6.0 |
| @supabase/supabase-js | 2.105.4 |
| @supabase/ssr | 0.10.3 |
| framer-motion | 12.38.0 |
| mapbox-gl | 3.23.1 |
| @google/generative-ai | 0.24.1 |
| react-hook-form | 7.75.0 |
| zod | 4.4.3 |
| zustand | 5.0.13 |
| lucide-react | 1.16.0 |
| sonner | 2.0.7 |
| date-fns | 4.1.0 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app rejected capital-letter directory name**
- **Found during:** Task 1
- **Issue:** `pnpm create next-app@latest .` failed because npm naming rules reject capital letters in the directory name "FSApp" when used as the package name
- **Fix:** Created project in `trailfilm/` subdirectory, moved all files to repo root, removed the subdirectory, updated package.json name to "trailfilm"
- **Files modified:** package.json (name field), all scaffold files moved to root
- **Commit:** 8249864

**2. [Rule 3 - Blocking] pnpm 11 requires explicit build approval for native packages**
- **Found during:** Task 1, Task 2
- **Issue:** `pnpm install` failed with ERR_PNPM_IGNORED_BUILDS for unrs-resolver and msw because pnpm 11 requires explicit allowance of build scripts
- **Fix:** Added `pnpm.onlyBuiltDependencies` in package.json and `allowBuilds` entries in pnpm-workspace.yaml for both packages
- **Files modified:** package.json, pnpm-workspace.yaml, .npmrc
- **Commit:** 8249864, eb968b6

**3. [Rule 1 - Deviation] shadcn@latest used base-nova style instead of Default/Slate**
- **Found during:** Task 2
- **Issue:** `pnpm dlx shadcn@latest init` created components.json with `"style": "base-nova"` and `"baseColor": "neutral"` instead of `"style": "default"` and `"baseColor": "slate"` as required by Build Guide §6.3 and UI-SPEC
- **Fix:** Used `pnpm dlx shadcn@2.6.0 add button input label form sonner --overwrite` which correctly uses the components.json config (manually corrected to style=default, baseColor=slate). The components installed correctly with the 2.6.0 CLI.
- **Files modified:** components.json
- **Commit:** eb968b6

## Brand Token Verification

All required brand tokens confirmed present in tailwind.config.ts:

| Token | Value | Status |
|-------|-------|--------|
| ink.DEFAULT | #0A0A0A | PRESENT |
| ink.50 | #FAFAF7 | PRESENT |
| ink-800 | #161616 | PRESENT |
| ink-700 | #1F1F1F | PRESENT |
| ink-500 | #4A4A4A | PRESENT |
| amber.accent | #E5A663 | PRESENT |
| amber-bright | #FFC881 | PRESENT |
| amber-deep | #B07F40 | PRESENT |
| parchment-200 | #E8E6DF | PRESENT |
| parchment-400 | #B5B2A8 | PRESENT |
| parchment-600 | #6B6862 | PRESENT |
| error | #D67867 | PRESENT |
| success | #5DBB7D | PRESENT |
| fontFamily.serif | var(--font-fraunces) | PRESENT |
| fontFamily.sans | var(--font-inter) | PRESENT |
| transitionTimingFunction.trailfilm | cubic-bezier(0.22, 1, 0.36, 1) | PRESENT |
| transitionDuration.800 | 800ms | PRESENT |
| transitionDuration.1200 | 1200ms | PRESENT |

## shadcn CSS Variables Note

shadcn@2.6.0 did NOT inject :root CSS variable blocks into globals.css (the --background, --foreground etc. CSS variables were not appended). This is because the component add was done with `--overwrite` and the globals.css already had the brand content. The shadcn components (button, input, label, form, sonner) reference CSS custom properties like `--ring`, `--background`, `--foreground`, `--primary`, `--destructive` etc. These are NOT defined in globals.css currently. This is expected and acceptable — the brand Tailwind tokens in tailwind.config.ts are the source of truth for Phase 1 UI. The shadcn CSS variables will be needed if shadcn's default variant classes are used directly; but the Phase 1 auth UI will use brand-token classes (bg-amber-accent, bg-ink-800, etc.) rather than shadcn's CSS var defaults.

**Note for Plan 04 (auth UI):** When building the MagicLinkForm, use brand Tailwind classes directly (bg-amber-accent, text-ink-50, etc.) rather than shadcn default variants which reference undefined CSS variables. The shadcn primitive components (Button, Input, Label, Form, Toaster) are the structural primitives; their styling will be overridden via className props.

## Known Stubs

None — this plan creates infrastructure only, no user-visible UI or data flows.

## Threat Surface Scan

No new network endpoints introduced. .env.local confirmed excluded by .gitignore. No client-side env var logging. SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix.

## Self-Check: PASSED

- [x] package.json exists with all 16 runtime deps
- [x] tailwind.config.ts contains ink-800, amber-accent, parchment-200, trailfilm easing, tailwindcss-animate plugin
- [x] src/app/globals.css contains @tailwind directives, @apply bg-ink, h1/h2/h3 font-serif, gradient-fade-bottom
- [x] src/app/layout.tsx imports Fraunces+Inter, declares --font-fraunces and --font-inter, metadata title="Trailfilm"
- [x] components.json exists with style=default, baseColor=slate, cssVariables=true
- [x] src/lib/utils.ts exports cn function
- [x] src/components/ui/ contains button.tsx, input.tsx, label.tsx, form.tsx, sonner.tsx
- [x] tailwindcss-animate in devDependencies
- [x] .env.local has all 6 keys (GEMINI_API_KEY and NEXT_PUBLIC_MAPBOX_TOKEN are real values, Supabase keys are placeholders)
- [x] .gitignore contains .env*.local pattern
- [x] .planning/ and Ideation/ directories exist and unmodified
- [x] Task 1 commit: 8249864
- [x] Task 2 commit: eb968b6
