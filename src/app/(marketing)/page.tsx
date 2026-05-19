'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

// ─── Scroll-reveal hook ────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '-40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

// ─── Parallax image hook ───────────────────────────────────────────────────
function useParallax(strength = 80) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])
  return { ref, y }
}

// ─── Data ──────────────────────────────────────────────────────────────────
const marqueeItems = [
  'Capture', 'Narrate', 'Preserve', 'Cinematic', 'Every Journey',
  'Your Story', 'Archive', 'Travel', 'Photographs', 'Prose',
]

const zigzagFeatures = [
  {
    index: '01',
    eyebrow: 'Drop & Discover',
    headline: 'Every frame,\nalive again.',
    body: 'Drop your photos and Trailfilm reads the light, the hour, the place. It builds a visual archive worthy of the journey — organised by geography, by time, by the quiet logic of how you travel.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85&auto=format&fit=crop',
    imageAlt: 'Winding road through mountain landscape at dawn',
  },
  {
    index: '02',
    eyebrow: 'Tone & Voice',
    headline: 'A story that\nsounds like you.',
    body: 'Choose your voice — lyrical, raw, precise, witty — and the AI director writes the chapter. Not a summary. A story. One that holds the weight of the moment without collapsing under description.',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85&auto=format&fit=crop',
    imageAlt: 'Aerial mountain valley at sunset',
  },
  {
    index: '03',
    eyebrow: 'Archive & Return',
    headline: 'An archive\nbuilt to last.',
    body: 'Every trip becomes a living document — photographs, prose, metadata — stored in a personal archive you\'ll actually revisit. Not a folder. A collection.',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=85&auto=format&fit=crop',
    imageAlt: 'Night sky over desert road',
  },
]

const stats = [
  { value: '94k', label: 'stories written' },
  { value: '∞', label: 'countries to explore' },
  { value: '4.9', label: 'avg story rating' },
  { value: '12min', label: 'avg to first draft' },
]

// Journey pins for the world map section — positions in % of SVG viewBox (1000×500)
const journeyPins = [
  { id: 1, x: 46.5, y: 14, label: 'Iceland', story: 'Midnight sun on Vatnajökull. 312 photos, 3 chapters.' },
  { id: 2, x: 68.0, y: 22, label: 'Mongolia', story: 'Steppes at dusk. 204 photos, 4 chapters.' },
  { id: 3, x: 46.0, y: 30, label: 'Morocco', story: 'The medina before dawn. 187 photos, 2 chapters.' },
  { id: 4, x: 74.2, y: 36, label: 'Borneo', story: 'River mist and orangutans. 421 photos, 5 chapters.' },
  { id: 5, x: 16.0, y: 72, label: 'Patagonia', story: 'Torres del Paine in fog. 340 photos, 4 chapters.' },
  { id: 6, x: 51.0, y: 42, label: 'Ethiopia', story: 'Lalibela at dawn. 267 photos, 3 chapters.' },
  { id: 7, x: 87.6, y: 70, label: 'New Zealand', story: 'Fiordland in rain. 389 photos, 4 chapters.' },
  { id: 8, x: 14.0, y: 30, label: 'Alaska', story: 'Denali in first snow. 156 photos, 2 chapters.' },
  { id: 9, x: 62.0, y: 36, label: 'Maldives', story: 'Bioluminescence at night. 298 photos, 3 chapters.' },
  { id: 10, x: 78.4, y: 20, label: 'Japan', story: 'Kumano Kodo in autumn. 512 photos, 6 chapters.' },
  { id: 11, x: 13.0, y: 52, label: 'Colombia', story: 'Coffee highlands at dawn. 143 photos, 2 chapters.' },
  { id: 12, x: 66.0, y: 14, label: 'Siberia', story: 'Lake Baikal in winter. 231 photos, 3 chapters.' },
]

// ─── Page ──────────────────────────────────────────────────────────────────
export default function MarketingPage() {
  const shouldReduce = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const t = (d: number, delay = 0) =>
    shouldReduce ? { duration: 0 } : { duration: d, delay, ease }

  const ctaRef = useReveal()

  return (
    <div className="relative bg-ink text-ink-50 overflow-x-hidden">

      {/* ── Grain overlay ─────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="grain-overlay pointer-events-none fixed inset-0 opacity-[0.028]"
        style={{ zIndex: 50 }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">

        {/* Full-bleed background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.04]"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85&auto=format&fit=crop')`,
            }}
          />
          {/* Heavy left vignette, lighter right — Northgarden style */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg,
                rgba(10,10,10,0.92) 0%,
                rgba(10,10,10,0.72) 30%,
                rgba(10,10,10,0.22) 60%,
                rgba(10,10,10,0.08) 100%
              )`,
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-48"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,1))' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 10% 85%, rgba(229,166,99,0.07) 0%, transparent 65%)',
            }}
          />
        </div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.7)}
          className="relative z-20 px-8 pt-10 md:px-16"
        >
          <span
            className="font-serif font-medium uppercase tracking-[0.07em] text-ink-50"
            style={{ fontSize: 'clamp(16px, 1.8vw, 20px)' }}
          >
            Trailfilm
          </span>
        </motion.div>

        {/* Hero content — strongly left-aligned */}
        <div className="relative z-20 flex flex-1 flex-col justify-end px-8 pb-20 pt-20 md:px-16 md:pb-28 lg:justify-center lg:pb-24">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={t(0.6, 0.1)}
            className="mb-8 flex items-center gap-3"
          >
            <div className="h-px w-8 bg-amber-accent opacity-70" />
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-parchment-400">
              Travel journaling, reimagined
            </span>
          </motion.div>

          {/* Main headline — massive, stacked, left-aligned */}
          <div className="max-w-[800px]">
            <motion.h1
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(1.0, 0.15)}
              className="font-serif font-medium uppercase leading-[0.92] tracking-[0.01em] text-ink-50"
              style={{ fontSize: 'clamp(54px, 10vw, 116px)' }}
            >
              Your memories
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(1.0, 0.22)}
              className="font-serif font-medium uppercase leading-[0.92] tracking-[0.01em]"
              style={{
                fontSize: 'clamp(54px, 10vw, 116px)',
                background: 'linear-gradient(135deg, #FFC881 0%, #E5A663 55%, #B07F40 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              deserve a
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(1.0, 0.29)}
              className="font-serif font-medium uppercase leading-[0.92] tracking-[0.01em] text-ink-50"
              style={{ fontSize: 'clamp(54px, 10vw, 116px)' }}
            >
              director.
            </motion.h1>
          </div>

          {/* Sub + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t(0.8, 0.55)}
            className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10 max-w-[800px]"
          >
            <p className="font-sans text-[14px] leading-[1.7] text-parchment-400 max-w-[320px]">
              Upload your photos. Get a cinematic story. Build an archive you&apos;ll actually return to.
            </p>

            <div className="flex items-center gap-5 shrink-0">
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-amber-accent px-7 py-3.5 font-sans text-sm font-medium text-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-amber-bright active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
              >
                <span className="relative z-10">Begin your archive</span>
                <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5v5.5" />
                  </svg>
                </span>
              </Link>
              <Link
                href="#story"
                className="font-sans text-[12px] text-parchment-600 underline underline-offset-4 decoration-parchment-600/30 transition-colors duration-200 hover:text-parchment-400 hover:decoration-parchment-400/40 cursor-pointer"
              >
                See a sample story
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Film-strip sprocket holes — right edge */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-6 z-10 hidden flex-col justify-center gap-[18px] opacity-[0.14] md:flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-2.5 w-1.5 rounded-[2px] bg-parchment-600" />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          MARQUEE STRIP
      ════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-white/[0.06] py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(10,10,10,1) 0%, transparent 10%, transparent 90%, rgba(10,10,10,1) 100%)',
            zIndex: 2,
          }}
        />
        <div className="marquee-track flex gap-12">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex shrink-0 items-center gap-12">
              <span className="font-serif text-[11px] uppercase tracking-[0.22em] text-parchment-600 whitespace-nowrap">
                {item}
              </span>
              <span className="h-1 w-1 rounded-full bg-amber-accent/40" />
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — ZIG-ZAG FEATURES
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-8 md:px-16">

          <RevealDiv className="mb-20 flex items-center gap-4">
            <div className="h-px w-8 bg-amber-accent/50" />
            <p className="font-sans text-[10px] uppercase tracking-[0.26em] text-parchment-600">
              How it works
            </p>
          </RevealDiv>

          <div className="space-y-32 md:space-y-44">
            {zigzagFeatures.map((f, i) => (
              <ZigzagFeature key={f.index} feature={f} flipped={i % 2 !== 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — STATS BAR
      ════════════════════════════════════════════════════════════════════ */}
      <StatsBar stats={stats} />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — STORY PREVIEW
      ════════════════════════════════════════════════════════════════════ */}
      <section id="story" className="relative py-24 md:py-40">
        <div className="mx-auto max-w-7xl px-8 md:px-16">

          <RevealDiv className="mb-16 grid md:grid-cols-[1fr_auto] md:items-end md:gap-16">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-6 bg-amber-accent/50" />
                <p className="font-sans text-[10px] uppercase tracking-[0.26em] text-parchment-600">Sample story</p>
              </div>
              <h2
                className="font-serif font-medium uppercase leading-[0.94] text-ink-50"
                style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}
              >
                This is what<br />your trip becomes.
              </h2>
            </div>
            <p className="mt-6 max-w-[260px] font-sans text-[13px] leading-[1.7] text-parchment-400 md:mt-0 md:text-right">
              A real AI-generated story, from a real journey. Tone:{' '}
              <span className="text-amber-accent">Cinematic &amp; lyrical.</span>
            </p>
          </RevealDiv>

          <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">

            {/* Left: trip meta */}
            <RevealDiv className="delay-100">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6">
                <p className="mb-4 font-sans text-[9px] uppercase tracking-[0.22em] text-parchment-600">Trip details</p>
                <div className="space-y-3">
                  {[
                    ['Destination', 'Atacama Desert, Chile'],
                    ['Duration', '11 days'],
                    ['Photos', '94 uploaded'],
                    ['Chapters', '4 generated'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                      <span className="font-sans text-[11px] text-parchment-600">{k}</span>
                      <span className="font-sans text-[11px]" style={{ color: '#CCC9C2' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-amber-accent/10 bg-amber-accent/[0.04] p-5">
                <p className="font-sans text-[11px] leading-[1.7] text-parchment-400">
                  &ldquo;Tone: cinematic, lyrical. Generated from 94 images. 4 chapters, 3,200 words.&rdquo;
                </p>
              </div>
            </RevealDiv>

            {/* Right: chapters */}
            <div className="space-y-4">
              <RevealDiv>
                <StoryChapter
                  label="Chapter I"
                  title="The Road Before Dawn"
                  text="The engine had been running for twenty minutes before the sky began to consider colour. Somewhere past the last visible ridge, the desert was still dark, holding its breath — a landscape that has learned patience across ten thousand years of silence. We drove without speaking, which felt right."
                />
              </RevealDiv>
              <RevealDiv className="delay-100">
                <StoryChapter
                  label="Chapter II"
                  title="Altitude"
                  text="At 3,400 metres the air acquires a quality that photographs cannot capture: a clarity so sharp it seems to strip something from the chest with each breath. The valley below had dissolved into haze. Up here, only rock, wind, and the specific blue that exists only at this elevation."
                />
              </RevealDiv>
              <RevealDiv className="delay-200">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-7">
                  <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-amber-accent/70">Chapter III</p>
                  <p className="font-serif text-xl font-medium text-ink-50/50">The Salt Flats at Midnight</p>
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.88) 50%, rgba(10,10,10,1) 100%)' }}
                  />
                  <div className="absolute inset-x-0 bottom-5 flex items-center justify-center">
                    <Link href="/login" className="font-sans text-[11px] text-parchment-600 transition-colors duration-200 hover:text-amber-accent cursor-pointer">
                      2 more chapters &middot; start your own story &rarr;
                    </Link>
                  </div>
                </div>
              </RevealDiv>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — WORLD MAP
      ════════════════════════════════════════════════════════════════════ */}
      <WorldMapSection />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 6 — CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-36">
        <div
          ref={ctaRef}
          className="reveal-up mx-auto max-w-7xl px-8 md:px-16"
        >
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
            <div
              className="absolute inset-0 bg-cover bg-center scale-[1.06]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1800&q=85&auto=format&fit=crop')`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.72) 45%, rgba(10,10,10,0.52) 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 70% at 5% 95%, rgba(229,166,99,0.1) 0%, transparent 60%)',
              }}
            />

            <div className="relative z-10 px-10 py-16 md:px-16 md:py-24 lg:px-24">
              <div aria-hidden className="absolute inset-x-0 top-5 flex justify-center gap-3 opacity-[0.10]">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-3 rounded-sm bg-parchment-600" />
                ))}
              </div>

              <div className="grid md:grid-cols-[1fr_auto] md:items-end md:gap-16">
                <div>
                  <p className="mb-6 font-sans text-[10px] uppercase tracking-[0.26em] text-parchment-600">
                    Begin your archive
                  </p>
                  <h2
                    className="font-serif font-medium uppercase leading-[0.92] text-ink-50"
                    style={{ fontSize: 'clamp(38px, 7vw, 80px)' }}
                  >
                    Every journey<br />
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #FFC881 0%, #E5A663 60%, #B07F40 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      deserves a story.
                    </span>
                  </h2>
                </div>

                <div className="mt-10 flex flex-col items-start gap-5 md:mt-0 md:items-end">
                  <p className="font-sans text-[13px] leading-[1.7] text-parchment-400 md:text-right max-w-[240px]">
                    Free to start. No credit card. Your first trip story in under five minutes.
                  </p>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-3 rounded-full bg-amber-accent px-7 py-3.5 font-sans text-sm font-medium text-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-amber-bright active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
                  >
                    <span>Create your account</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5v5.5" />
                      </svg>
                    </span>
                  </Link>
                  <p className="font-sans text-[11px] text-parchment-600">
                    Built for wherever the road takes you.
                  </p>
                </div>
              </div>

              <div aria-hidden className="absolute inset-x-0 bottom-5 flex justify-center gap-3 opacity-[0.10]">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-3 rounded-sm bg-parchment-600" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.05] py-14">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div>
              <span
                className="font-serif font-medium uppercase tracking-[0.07em] text-ink-50"
                style={{ fontSize: '18px' }}
              >
                Trailfilm
              </span>
              <p className="mt-2 font-sans text-[12px] text-parchment-600">
                Your memories deserve a director.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {[
                ['Log in', '/login'],
                ['Sign up', '/login'],
                ['Privacy', '#'],
                ['Terms', '#'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="font-sans text-[12px] text-parchment-600 transition-colors duration-200 hover:text-parchment-400 cursor-pointer"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[0.08, 0.22, 0.6, 1, 0.6, 0.22, 0.08].map((op, i) => (
                <div key={i} className="h-px w-7 bg-parchment-600" style={{ opacity: op }} />
              ))}
            </div>
            <p className="font-sans text-[11px] text-parchment-600 opacity-40">
              &copy; {new Date().getFullYear()} Trailfilm
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ─── RevealDiv ─────────────────────────────────────────────────────────────
function RevealDiv({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal-up ${className}`}>
      {children}
    </div>
  )
}

// ─── StatsBar ──────────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: { value: string; label: string }[] }) {
  const ref = useReveal()
  return (
    <div className="border-y border-white/[0.06]">
      <div
        ref={ref}
        className="reveal-up mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.06] px-8 md:grid-cols-4 md:px-16"
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center px-6 py-10 text-center"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span
              className="font-serif font-medium text-ink-50"
              style={{ fontSize: 'clamp(30px, 4.5vw, 48px)' }}
            >
              {s.value}
            </span>
            <span className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-parchment-600">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ZigzagFeature ─────────────────────────────────────────────────────────
function ZigzagFeature({
  feature,
  flipped,
}: {
  feature: (typeof zigzagFeatures)[0]
  flipped: boolean
}) {
  const textRef = useReveal()
  const { ref: imgRef, y } = useParallax(50)

  return (
    <div className={`grid items-center gap-12 md:grid-cols-2 md:gap-20 ${flipped ? 'md:[&>*:first-child]:order-2' : ''}`}>

      <div ref={textRef} className="reveal-up">
        <p className="mb-4 font-sans text-[9px] uppercase tracking-[0.3em] text-amber-accent/70">
          {feature.index} — {feature.eyebrow}
        </p>
        <h3
          className="font-serif font-medium uppercase leading-[0.95] text-ink-50"
          style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', whiteSpace: 'pre-line' }}
        >
          {feature.headline}
        </h3>
        <p className="mt-6 font-sans text-[14px] leading-[1.75] text-parchment-400 max-w-[400px]">
          {feature.body}
        </p>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px w-10 bg-white/10" />
          <div className="h-px w-4 bg-amber-accent/30" />
        </div>
      </div>

      <div ref={imgRef} className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem]">
        <motion.div style={{ y }} className="relative">
          <div
            className="h-[340px] w-full bg-cover bg-center md:h-[480px]"
            style={{ backgroundImage: `url('${feature.image}')` }}
            role="img"
            aria-label={feature.imageAlt}
          />
          <div
            className="absolute inset-0 rounded-[inherit]"
            style={{
              background: 'linear-gradient(145deg, rgba(10,10,10,0.25) 0%, transparent 40%, rgba(10,10,10,0.3) 100%)',
            }}
          />
        </motion.div>
        <div className="absolute bottom-5 right-5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-parchment-600">
            {feature.index} / 03
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── StoryChapter ──────────────────────────────────────────────────────────
function StoryChapter({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-7">
      <div aria-hidden className="story-text-shimmer pointer-events-none absolute inset-0" />
      <p className="relative mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-amber-accent/80">{label}</p>
      <p className="relative mb-4 font-serif text-xl font-medium text-ink-50">{title}</p>
      <p className="relative font-sans text-[13.5px] leading-[1.78] text-parchment-400">{text}</p>
    </div>
  )
}

// ─── WorldMapSection ───────────────────────────────────────────────────────
function WorldMapSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activePin, setActivePin] = useState<number | null>(null)
  const [visiblePins, setVisiblePins] = useState<Set<number>>(new Set())
  const headingRef = useReveal()

  // Stagger-reveal pins on scroll into view
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          journeyPins.forEach((pin, i) => {
            setTimeout(() => {
              setVisiblePins(prev => new Set(Array.from(prev).concat(pin.id)))
            }, i * 120)
          })
          observer.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% 50%, rgba(229,166,99,0.04) 0%, transparent 65%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-8 md:px-16">

        {/* Header */}
        <div ref={headingRef} className="reveal-up mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-6 bg-amber-accent/50" />
            <p className="font-sans text-[10px] uppercase tracking-[0.26em] text-parchment-600">The archive</p>
          </div>
          <div className="grid md:grid-cols-[1fr_auto] md:items-end md:gap-16">
            <h2
              className="font-serif font-medium uppercase leading-[0.94] text-ink-50"
              style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
            >
              Journeys archived<br />across the world.
            </h2>
            <p className="mt-4 max-w-[260px] font-sans text-[13px] leading-[1.7] text-parchment-400 md:mt-0 md:text-right">
              Every pin is a real trip. Hover to see the story that lives inside it.
            </p>
          </div>
        </div>

        {/* Map container */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.015]">

          {/* SVG World Map illustration */}
          <div className="relative w-full" style={{ paddingBottom: '50%' }}>
            <svg
              viewBox="0 0 1000 500"
              className="absolute inset-0 w-full h-full"
              aria-hidden
            >
              {/* Subtle grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </pattern>
                <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E5A663" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#E5A663" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="1000" height="500" fill="url(#grid)" />
              <rect width="1000" height="500" fill="url(#gridLarge)" />

              {/* Longitude lines */}
              {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}
              {/* Latitude lines */}
              {[0, 125, 250, 375, 500].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}

              {/* Equator */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(229,166,99,0.08)" strokeWidth="1" strokeDasharray="4 8" />

              {/* Continent outlines — geographically accurate simplified paths */}
              {/* North America */}
              <path
                d="M 132,58 L 148,52 L 162,55 L 178,50 L 192,54 L 200,62 L 210,60 L 218,68 L 212,78 L 220,85 L 216,95 L 222,105 L 218,118 L 208,128 L 198,138 L 188,148 L 178,160 L 168,170 L 158,180 L 148,192 L 140,200 L 130,208 L 120,202 L 112,195 L 105,185 L 100,175 L 96,162 L 100,150 L 98,138 L 104,128 L 108,118 L 105,108 L 110,98 L 115,88 L 120,78 L 126,68 Z"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
              {/* Central America / Caribbean connector */}
              <path
                d="M 140,200 L 148,210 L 152,218 L 156,226 L 154,232 L 148,236 L 144,230 L 140,222 L 136,214 L 138,206 Z"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
              {/* South America */}
              <path
                d="M 152,238 L 168,232 L 182,236 L 196,244 L 208,254 L 216,266 L 220,280 L 222,294 L 218,310 L 210,324 L 200,338 L 190,352 L 178,362 L 166,370 L 155,374 L 145,368 L 138,356 L 134,342 L 132,328 L 134,314 L 136,300 L 136,286 L 138,272 L 140,258 L 144,246 Z"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
              {/* Greenland */}
              <path
                d="M 230,30 L 248,26 L 262,30 L 268,42 L 264,54 L 252,60 L 238,56 L 228,46 Z"
                fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              {/* Europe */}
              <path
                d="M 452,72 L 462,66 L 474,64 L 486,66 L 496,72 L 504,80 L 508,90 L 512,100 L 508,110 L 500,116 L 492,122 L 480,126 L 468,124 L 458,118 L 450,110 L 446,100 L 446,90 L 448,80 Z M 462,66 L 468,58 L 478,54 L 486,56 L 492,62 L 490,68 L 480,70 L 470,68 Z M 488,80 L 498,74 L 506,76 L 510,84 L 504,88 L 496,86 Z"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
              {/* Scandinavia */}
              <path
                d="M 464,52 L 472,44 L 482,42 L 490,46 L 492,54 L 488,60 L 480,62 L 472,60 Z M 456,50 L 462,42 L 468,42 L 470,48 L 466,52 Z"
                fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
              {/* Africa */}
              <path
                d="M 454,138 L 468,130 L 484,128 L 498,130 L 510,136 L 520,146 L 526,158 L 528,172 L 526,188 L 522,204 L 516,220 L 508,236 L 498,252 L 486,266 L 474,276 L 462,282 L 450,278 L 440,268 L 432,254 L 426,238 L 422,222 L 420,206 L 420,190 L 422,174 L 426,160 L 432,148 L 440,140 Z"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
              {/* Madagascar */}
              <path
                d="M 536,222 L 542,216 L 548,220 L 550,230 L 546,240 L 540,244 L 534,240 L 532,230 Z"
                fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              {/* Middle East / Arabia */}
              <path
                d="M 530,128 L 546,122 L 560,120 L 572,124 L 578,134 L 576,146 L 568,154 L 556,158 L 544,154 L 534,146 L 528,136 Z"
                fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
              {/* Asia (main body) */}
              <path
                d="M 512,72 L 530,64 L 550,60 L 572,58 L 596,56 L 622,54 L 648,52 L 672,54 L 694,58 L 714,64 L 730,72 L 742,82 L 748,94 L 746,106 L 738,116 L 724,124 L 708,130 L 692,134 L 674,136 L 656,136 L 638,132 L 620,128 L 602,124 L 584,122 L 568,122 L 554,126 L 542,132 L 532,124 L 522,114 L 514,104 L 510,92 Z"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
              {/* Indian Subcontinent */}
              <path
                d="M 598,134 L 614,130 L 628,132 L 638,140 L 642,152 L 638,164 L 628,172 L 616,176 L 604,172 L 596,162 L 594,150 Z"
                fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
              {/* Southeast Asia */}
              <path
                d="M 700,138 L 716,132 L 730,130 L 742,134 L 750,142 L 752,152 L 746,160 L 734,164 L 720,162 L 708,156 L 700,148 Z"
                fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
              {/* Japan */}
              <path
                d="M 776,80 L 782,74 L 790,76 L 794,84 L 790,92 L 782,94 L 776,88 Z"
                fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              {/* Indonesia / Philippines (islands) */}
              <path
                d="M 724,168 L 732,164 L 740,166 L 746,172 L 744,180 L 736,184 L 728,180 L 722,174 Z M 750,162 L 758,158 L 766,160 L 770,166 L 766,172 L 758,174 L 752,170 Z M 712,178 L 720,174 L 728,176 L 730,184 L 724,190 L 716,188 Z"
                fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              {/* Australia */}
              <path
                d="M 756,296 L 778,288 L 800,288 L 820,292 L 838,300 L 850,312 L 856,326 L 854,342 L 846,356 L 832,366 L 816,372 L 798,374 L 780,370 L 764,360 L 752,346 L 746,330 L 746,314 L 750,302 Z"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
              {/* New Zealand */}
              <path
                d="M 870,346 L 876,340 L 882,342 L 884,350 L 880,358 L 874,358 L 870,352 Z M 876,360 L 882,354 L 888,356 L 890,364 L 886,372 L 880,372 L 876,366 Z"
                fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              {/* UK / Ireland */}
              <path
                d="M 446,68 L 452,62 L 458,64 L 458,72 L 452,76 L 446,72 Z M 438,70 L 444,66 L 448,70 L 446,76 L 440,76 Z"
                fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            </svg>

            {/* Journey pins */}
            {journeyPins.map((pin) => (
              <JourneyPin
                key={pin.id}
                pin={pin}
                isVisible={visiblePins.has(pin.id)}
                isActive={activePin === pin.id}
                onEnter={() => setActivePin(pin.id)}
                onLeave={() => setActivePin(null)}
              />
            ))}
          </div>

          {/* Bottom info strip */}
          <div className="border-t border-white/[0.05] px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-accent" />
                <span className="font-sans text-[11px] text-parchment-600">Archived journey</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full border border-amber-accent/40 bg-transparent" style={{
                  boxShadow: '0 0 6px rgba(229,166,99,0.3)'
                }} />
                <span className="font-sans text-[11px] text-parchment-600">Active story</span>
              </div>
            </div>
            <span className="font-sans text-[11px] text-parchment-600 hidden sm:block">
              {journeyPins.length} journeys &middot; hover to explore
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── JourneyPin ────────────────────────────────────────────────────────────
function JourneyPin({
  pin,
  isVisible,
  isActive,
  onEnter,
  onLeave,
}: {
  pin: (typeof journeyPins)[0]
  isVisible: boolean
  isActive: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  return (
    <div
      className="absolute"
      style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Ripple ring */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-amber-accent/50"
            style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
          />
        )}
      </AnimatePresence>

      {/* Pin dot */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.4 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        className="relative z-10 h-3 w-3 rounded-full bg-amber-accent cursor-pointer focus:outline-none"
        style={{
          boxShadow: isActive
            ? '0 0 12px rgba(229,166,99,0.8), 0 0 4px rgba(229,166,99,0.6)'
            : '0 0 6px rgba(229,166,99,0.4)',
        }}
        aria-label={`Journey: ${pin.label}`}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute z-20 w-44 rounded-xl border border-white/10 bg-ink/95 px-4 py-3 backdrop-blur-md"
            style={{
              bottom: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="mb-1 font-sans text-[10px] uppercase tracking-[0.18em] text-amber-accent/80">
              {pin.label}
            </p>
            <p className="font-sans text-[11px] leading-[1.6] text-parchment-400">
              {pin.story}
            </p>
            {/* Caret */}
            <div
              className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-ink"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
