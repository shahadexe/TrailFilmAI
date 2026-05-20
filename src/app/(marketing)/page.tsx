'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, useInView } from 'framer-motion'
import { WorldMap } from '@/components/ui/world-map'

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

const JOURNEY_ARCS = [
  { start: { lat: 65, lng: -18 },  end: { lat: -3,  lng: 37  } },  // Iceland → Kilimanjaro
  { start: { lat: 63, lng: -153 }, end: { lat: -51, lng: -72 } },  // Alaska → Patagonia
  { start: { lat: 32, lng: -5  },  end: { lat: 9,   lng: 38  } },  // Morocco → Ethiopia
  { start: { lat: 65, lng: -18 },  end: { lat: 47,  lng: 103 } },  // Iceland → Mongolia
  { start: { lat: 36, lng: 138 },  end: { lat: -41, lng: 172 } },  // Japan → New Zealand
  { start: { lat: 4,  lng: -74 },  end: { lat: 32,  lng: -5  } },  // Colombia → Morocco
  { start: { lat: 53, lng: 108 },  end: { lat: 1,   lng: 114 } },  // Siberia → Borneo
  { start: { lat: 63, lng: -153 }, end: { lat: 36,  lng: 138 } },  // Alaska → Japan
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
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 opacity-40">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#9C9C9C"/>
                </svg>
                <span className="font-sans text-[11px] text-parchment-600">
                  Powered by Mapbox
                </span>
              </div>
              <p className="font-sans text-[11px] text-parchment-600 opacity-40">
                &copy; {new Date().getFullYear()} Trailfilm
              </p>
            </div>
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
  const headingRef = useReveal()
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const isHeadlineInView = useInView(headlineRef, { once: true, margin: '-80px' })
  const shouldReduceMotion = useReducedMotion()

  const headline = 'Journeys archived across the world.'

  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 50%, rgba(229,166,99,0.04) 0%, transparent 65%)' }}
      />
      <div className="mx-auto max-w-7xl px-8 md:px-16">
        <div ref={headingRef} className="reveal-up mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-6 bg-amber-accent/50" />
            <p className="font-sans text-[10px] uppercase tracking-[0.26em] text-parchment-600">The archive</p>
          </div>
          <div className="grid md:grid-cols-[1fr_auto] md:items-end md:gap-16">
            <h2
              ref={headlineRef}
              className="font-serif font-medium uppercase leading-[0.94] text-ink-50"
              style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
            >
              {shouldReduceMotion ? (
                headline
              ) : (
                headline.split('').map((char, i) =>
                  char === ' ' ? (
                    <motion.span key={i} style={{ display: 'inline-block', width: '0.3em' }} />
                  ) : (
                    <motion.span
                      key={i}
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isHeadlineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.5, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {char}
                    </motion.span>
                  )
                )
              )}
            </h2>
            <p className="mt-4 max-w-[260px] font-sans text-[13px] leading-[1.7] text-parchment-400 md:mt-0 md:text-right">
              Every arc is a real journey. Twelve trips. One archive.
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.015]">
          <WorldMap dots={JOURNEY_ARCS} />
        </div>
      </div>
    </section>
  )
}
