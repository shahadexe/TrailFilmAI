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

// Journey pins — svgX = (lon+180)/360*1008, svgY = (90-lat)/180*504
// Stored as % of viewBox so pins stay relative regardless of rendered size
// x% = svgX/1008*100, y% = svgY/504*100
const journeyPins = [
  // Iceland: lon=-18, lat=65  → x=45.0%, y=13.9%
  { id: 1, x: 45.0, y: 13.9, label: 'Iceland', story: 'Midnight sun on Vatnajökull. 312 photos, 3 chapters.' },
  // Mongolia: lon=103, lat=47 → x=78.7%, y=23.9%
  { id: 2, x: 78.7, y: 23.9, label: 'Mongolia', story: 'Steppes at dusk. 204 photos, 4 chapters.' },
  // Morocco: lon=-5, lat=32   → x=48.6%, y=32.2%
  { id: 3, x: 48.6, y: 32.2, label: 'Morocco', story: 'The medina before dawn. 187 photos, 2 chapters.' },
  // Borneo: lon=114, lat=1    → x=81.7%, y=49.4%
  { id: 4, x: 81.7, y: 49.4, label: 'Borneo', story: 'River mist and orangutans. 421 photos, 5 chapters.' },
  // Patagonia: lon=-72, lat=-51 → x=30.0%, y=78.3%
  { id: 5, x: 30.0, y: 78.3, label: 'Patagonia', story: 'Torres del Paine in fog. 340 photos, 4 chapters.' },
  // Ethiopia: lon=38, lat=9   → x=60.5%, y=45.0%
  { id: 6, x: 60.5, y: 45.0, label: 'Ethiopia', story: 'Lalibela at dawn. 267 photos, 3 chapters.' },
  // New Zealand: lon=172, lat=-41 → x=97.2%, y=72.8%
  { id: 7, x: 97.2, y: 72.8, label: 'New Zealand', story: 'Fiordland in rain. 389 photos, 4 chapters.' },
  // Alaska: lon=-153, lat=63  → x=7.5%, y=15.0%
  { id: 8, x: 7.5, y: 15.0, label: 'Alaska', story: 'Denali in first snow. 156 photos, 2 chapters.' },
  // Japan: lon=138, lat=36    → x=88.3%, y=30.0%
  { id: 9, x: 88.3, y: 30.0, label: 'Japan', story: 'Kumano Kodo in autumn. 512 photos, 6 chapters.' },
  // Colombia: lon=-74, lat=4  → x=29.4%, y=47.8%
  { id: 10, x: 29.4, y: 47.8, label: 'Colombia', story: 'Coffee highlands at dawn. 143 photos, 2 chapters.' },
  // Lake Baikal (Siberia): lon=108, lat=53 → x=80.2%, y=20.6%
  { id: 11, x: 80.2, y: 20.6, label: 'Siberia', story: 'Lake Baikal in winter. 231 photos, 3 chapters.' },
  // Tanzania/Kilimanjaro: lon=37, lat=-3 → x=60.3%, y=51.7%
  { id: 12, x: 60.3, y: 51.7, label: 'Kilimanjaro', story: 'Sunrise above the clouds. 178 photos, 2 chapters.' },
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

// ─── Real world map — Natural Earth simplified equirectangular (180°W→180°E, 90°N→90°S)
// viewBox "0 0 1008 504" maps lon/lat: x = (lon+180)/360*1008, y = (90-lat)/180*504
const WORLD_PATHS = [
  // North America (mainland)
  "M87,72 L100,58 L115,52 L128,56 L140,50 L158,46 L170,52 L182,48 L194,54 L202,62 L210,58 L220,64 L226,74 L218,82 L224,92 L218,102 L222,112 L214,122 L206,134 L196,144 L184,154 L172,162 L162,172 L150,182 L140,190 L128,196 L118,190 L108,182 L100,172 L94,160 L92,148 L96,136 L94,124 L100,114 L104,102 L100,92 L104,82 Z",
  // Alaska
  "M56,64 L68,58 L80,60 L88,68 L84,76 L74,78 L62,76 Z",
  // Greenland
  "M222,30 L238,22 L256,20 L270,26 L276,38 L272,52 L260,60 L244,62 L232,54 L224,42 Z",
  // Central America
  "M148,196 L156,202 L162,210 L164,218 L158,224 L150,222 L144,214 L140,206 Z",
  // Caribbean (Cuba approximation)
  "M166,192 L178,188 L186,192 L182,198 L170,198 Z",
  // South America
  "M156,228 L172,220 L188,222 L202,230 L214,242 L222,256 L226,272 L226,290 L222,308 L214,326 L204,342 L192,356 L178,368 L164,376 L152,372 L142,360 L136,346 L132,330 L132,314 L134,298 L136,282 L138,266 L140,250 L146,238 Z",
  // Iceland
  "M388,54 L400,50 L410,54 L412,62 L404,68 L392,66 L386,60 Z",
  // UK + Ireland
  "M420,80 L428,74 L436,76 L438,84 L434,92 L424,92 L420,84 Z M412,82 L418,78 L422,82 L420,90 L412,88 Z",
  // Iberian Peninsula
  "M418,104 L432,98 L444,100 L448,112 L442,122 L430,126 L418,120 L414,110 Z",
  // France
  "M438,90 L454,86 L464,90 L466,100 L458,108 L444,110 L436,102 Z",
  // Scandinavia + Norway
  "M450,56 L460,44 L470,40 L482,44 L488,54 L482,64 L470,68 L458,66 Z M466,68 L474,60 L484,62 L484,72 L474,76 L466,74 Z",
  // Germany, Benelux, central Europe
  "M452,84 L468,78 L480,80 L482,90 L474,98 L460,100 L450,94 Z",
  // Italy
  "M458,100 L470,94 L478,98 L476,112 L466,124 L456,130 L450,120 L452,108 Z",
  // Balkans + Greece
  "M476,96 L490,92 L500,96 L504,108 L498,118 L484,118 L474,110 Z",
  // Eastern Europe + Baltic
  "M476,72 L494,66 L510,64 L520,70 L518,84 L508,90 L490,90 L478,82 Z",
  // Africa (main continent)
  "M432,148 L450,138 L468,134 L486,136 L500,142 L512,152 L520,164 L522,178 L518,194 L510,210 L500,226 L488,242 L474,256 L460,268 L446,276 L432,272 L420,260 L412,246 L406,230 L404,214 L404,198 L408,182 L414,168 L422,156 Z",
  // Madagascar
  "M524,234 L532,226 L540,230 L542,244 L536,254 L528,252 L522,242 Z",
  // Arabian Peninsula
  "M516,138 L534,128 L550,126 L562,132 L566,144 L560,156 L546,162 L532,158 L520,148 Z",
  // Turkey
  "M492,104 L510,98 L526,98 L534,106 L530,116 L514,120 L496,118 L490,110 Z",
  // Russia (Europe) / Ukraine
  "M490,72 L520,62 L548,60 L566,64 L572,74 L560,84 L538,88 L514,88 L494,82 Z",
  // Russia (Siberia / Asia main)
  "M548,40 L590,30 L640,24 L690,22 L736,26 L774,34 L800,44 L810,56 L800,68 L780,74 L750,76 L718,74 L686,72 L652,68 L618,64 L586,60 L560,56 Z",
  // Kazakhstan / Central Asia
  "M556,80 L590,72 L624,70 L650,74 L660,86 L644,96 L612,100 L578,98 L556,90 Z",
  // Iran
  "M548,118 L568,112 L588,112 L600,120 L600,132 L588,140 L566,142 L548,134 Z",
  // Afghanistan / Pakistan
  "M586,108 L606,102 L626,102 L638,110 L634,122 L618,128 L596,128 L582,120 Z",
  // India
  "M608,128 L628,122 L642,126 L646,140 L640,154 L626,164 L610,166 L598,156 L596,142 Z",
  // Sri Lanka
  "M626,168 L632,164 L636,168 L634,174 L626,174 Z",
  // China (main)
  "M636,80 L670,70 L706,68 L728,74 L734,86 L724,98 L704,106 L678,110 L650,110 L628,106 L618,96 L620,84 Z",
  // Korean Peninsula
  "M744,90 L754,84 L762,86 L762,96 L754,102 L744,98 Z",
  // Japan (Honshu)
  "M770,80 L782,74 L792,78 L794,88 L786,96 L774,94 Z",
  // Japan (Kyushu/Shikoku)
  "M760,94 L768,90 L776,94 L774,100 L766,102 Z",
  // Indochina (SE Asia peninsula)
  "M676,118 L694,112 L710,114 L718,126 L714,138 L702,144 L686,142 L674,132 Z",
  // Malay Peninsula
  "M698,144 L706,138 L714,142 L714,154 L706,162 L698,158 Z",
  // Sumatra
  "M700,162 L722,154 L740,154 L750,164 L744,174 L722,176 L704,172 Z",
  // Borneo
  "M724,160 L744,156 L760,158 L766,170 L760,182 L740,184 L724,176 Z",
  // Java
  "M720,178 L740,174 L754,176 L754,184 L736,186 L720,184 Z",
  // Philippines
  "M754,136 L762,130 L770,132 L772,142 L764,148 L756,144 Z",
  // Australia
  "M756,296 L784,284 L812,282 L838,286 L858,296 L870,310 L872,328 L864,346 L848,360 L828,368 L804,370 L780,364 L760,352 L746,336 L744,318 L748,304 Z",
  // Tasmania
  "M800,374 L810,370 L818,374 L816,382 L806,384 Z",
  // New Zealand (North Island)
  "M874,342 L882,334 L890,336 L892,346 L886,354 L876,352 Z",
  // New Zealand (South Island)
  "M876,356 L886,350 L894,352 L896,364 L888,374 L878,372 L872,364 Z",
  // Papua New Guinea
  "M794,222 L812,214 L830,214 L842,222 L840,232 L822,236 L804,232 Z",
  // Morocco / NW Africa
  "M418,130 L434,124 L442,130 L440,142 L428,146 L416,140 Z",
]

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

          {/* SVG World Map — Natural Earth simplified, viewBox 0 0 1008 504
              x = (lon + 180) / 360 * 1008   y = (90 - lat) / 180 * 504 */}
          <div className="relative w-full" style={{ paddingBottom: '50%' }}>
            <svg
              viewBox="0 0 1008 504"
              className="absolute inset-0 w-full h-full"
              aria-hidden
            >
              <defs>
                <pattern id="mapGrid" width="56" height="56" patternUnits="userSpaceOnUse">
                  <path d="M56 0 L0 0 0 56" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="1008" height="504" fill="url(#mapGrid)" />

              {/* Latitude lines: 60N, 30N, 0 (equator), 30S, 60S */}
              {[84, 168, 252, 336, 420].map(y => (
                <line key={y} x1="0" y1={y} x2="1008" y2={y}
                  stroke={y === 252 ? 'rgba(229,166,99,0.10)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth={y === 252 ? 1 : 0.5}
                  strokeDasharray={y === 252 ? '6 10' : undefined} />
              ))}
              {/* Longitude lines every 30° */}
              {[84, 168, 252, 336, 420, 504, 588, 672, 756, 840, 924].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="504" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              ))}

              {/* ── Land masses (Natural Earth simplified equirectangular) ── */}
              {WORLD_PATHS.map((d, i) => (
                <path key={i} d={d}
                  fill="rgba(255,255,255,0.055)"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              ))}
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
