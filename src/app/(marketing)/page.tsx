'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion'
import { WorldMap } from '@/components/ui/world-map'

// ─── Easing constants ─────────────────────────────────────────────────────────
const EASE_TRAILFILM = [0.22, 1, 0.36, 1] as const
const EASE_DRAWER    = [0.32, 0.72, 0, 1] as const

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); io.unobserve(el) } },
      { threshold, rootMargin: '-32px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}

// ─── Parallax image hook ──────────────────────────────────────────────────────
function useParallax(strength = 60) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])
  return { ref, y }
}

// ─── Magnetic button hook ─────────────────────────────────────────────────────
function useMagnetic(strength = 0.25) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 20 })
  const sy = useSpring(y, { stiffness: 200, damping: 20 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      x.set((e.clientX - r.left - r.width / 2) * strength)
      y.set((e.clientY - r.top - r.height / 2) * strength)
    }
    const reset = () => { x.set(0); y.set(0) }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', reset)
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', reset) }
  }, [x, y, strength])

  return { ref, sx, sy }
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const marqueeItems = [
  'Capture', 'Narrate', 'Preserve', 'Cinematic', 'Every Journey',
  'AI Documentary', 'Memory Globe', 'Animated Maps', 'Archive', 'Travel',
]

const JOURNEY_ARCS = [
  { start: { lat: 65, lng: -18 },  end: { lat: -3,  lng: 37  } },
  { start: { lat: 63, lng: -153 }, end: { lat: -51, lng: -72 } },
  { start: { lat: 32, lng: -5  },  end: { lat: 9,   lng: 38  } },
  { start: { lat: 65, lng: -18 },  end: { lat: 47,  lng: 103 } },
  { start: { lat: 36, lng: 138 },  end: { lat: -41, lng: 172 } },
  { start: { lat: 4,  lng: -74 },  end: { lat: 32,  lng: -5  } },
  { start: { lat: 53, lng: 108 },  end: { lat: 1,   lng: 114 } },
  { start: { lat: 63, lng: -153 }, end: { lat: 36,  lng: 138 } },
]

const stats = [
  { value: '94k',   label: 'stories written' },
  { value: '∞',     label: 'countries to explore' },
  { value: '4.9',   label: 'avg story rating' },
  { value: '12min', label: 'avg to first draft' },
]

const capabilities = [
  {
    id: 'documentary',
    eyebrow: 'AI Documentary',
    headline: 'Your photos become\na cinematic film.',
    body: 'Gemini 2.5 Flash reads the light and geography of every frame. Kling AI renders each photo into a cinematic 5-second video clip. Assembled automatically into a documentary of your journey.',
    tag: 'Gemini 2.5 Flash · Kling AI',
    span: 'md:col-span-2',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=85&auto=format&fit=crop',
  },
  {
    id: 'globe',
    eyebrow: 'Memory Globe',
    headline: 'All your trips,\non one planet.',
    body: 'A 3D interactive globe of your complete travel history. Every visited country glows amber. Click any nation to browse the trips you took there.',
    tag: 'react-globe.gl · WebGL',
    span: 'md:col-span-1',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'maps',
    eyebrow: 'Animated Maps',
    headline: 'Share the\nroute.',
    body: 'Every trip generates a shareable animated travel map — glowing amber route lines, flight arcs, animated dashes. Send the link. Anyone can watch your journey unfold.',
    tag: 'Mapbox · SVG animation',
    span: 'md:col-span-1',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'story',
    eyebrow: 'AI Story',
    headline: 'A story that\nsounds like you.',
    body: 'Choose your voice — lyrical, raw, precise, documentary — and the AI writes chapters anchored to each photo and GPS coordinate. Not a summary. A story.',
    tag: 'Gemini 2.5 Flash',
    span: 'md:col-span-2',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=85&auto=format&fit=crop',
  },
]

// ─── Stacked scroll feature data ──────────────────────────────────────────────
const stackedFeatures = [
  {
    index: '01',
    eyebrow: 'Drop & Discover',
    headline: 'Every frame,\nalive again.',
    body: 'Drop your photos and Trailfilm reads the light, the hour, the place. It builds a visual archive organised by geography, time, and the quiet logic of how you travel.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85&auto=format&fit=crop',
    color: 'rgba(229,166,99,0.06)',
  },
  {
    index: '02',
    eyebrow: 'Tone & Voice',
    headline: 'A director\nin your pocket.',
    body: 'Gemini 2.5 Flash analyses every image multimodally — reading light, location, mood — then writes cinematic scene descriptions for each moment of your journey.',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=85&auto=format&fit=crop',
    color: 'rgba(229,166,99,0.04)',
  },
  {
    index: '03',
    eyebrow: 'Archive & Return',
    headline: 'An archive\nbuilt to last.',
    body: 'Every trip becomes a living document — photographs, AI prose, animated maps, cinematic film — stored in a personal archive you\'ll actually revisit.',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=85&auto=format&fit=crop',
    color: 'rgba(229,166,99,0.03)',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function MarketingPage() {
  const prefersReduced = useReducedMotion()
  const t = (d: number, delay = 0) =>
    prefersReduced ? { duration: 0 } : { duration: d, delay, ease: EASE_TRAILFILM }

  return (
    <div className="relative bg-ink text-ink-50 overflow-x-hidden">

      {/* Grain overlay — fixed, pointer-events-none, off the GPU repaint path */}
      <div
        aria-hidden
        className="grain-overlay pointer-events-none fixed inset-0 opacity-[0.028]"
        style={{ zIndex: 50 }}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO  (full-bleed cinematic, left-weighted)
      ══════════════════════════════════════════════════════════════════════ */}
      <HeroSection t={t} />

      {/* ══════════════════════════════════════════════════════════════════════
          MARQUEE STRIP
      ══════════════════════════════════════════════════════════════════════ */}
      <MarqueeStrip />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — STICKY SCROLL STACK  (3D depth)
      ══════════════════════════════════════════════════════════════════════ */}
      <StackedScrollSection />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — BENTO CAPABILITIES GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <BentoSection />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — STATS BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <StatsBar stats={stats} />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — SAMPLE STORY
      ══════════════════════════════════════════════════════════════════════ */}
      <StorySection />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — WORLD MAP
      ══════════════════════════════════════════════════════════════════════ */}
      <WorldMapSection />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7 — FINAL CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <CTASection />

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <MarketingFooter />

    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ t }: { t: (d: number, delay?: number) => object }) {
  const prefersReduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const heroY     = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const { ref: magRef, sx, sy } = useMagnetic(0.3)

  return (
    <section ref={sectionRef} className="relative flex min-h-[100dvh] flex-col overflow-hidden">

      {/* Full-bleed parallax background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute inset-[-8%] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=85&auto=format&fit=crop')`,
            y: prefersReduced ? 0 : heroY,
            scale: prefersReduced ? 1 : heroScale,
          }}
        />
        {/* Cinematic left vignette */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(108deg,
            rgba(10,10,10,0.96) 0%,
            rgba(10,10,10,0.78) 28%,
            rgba(10,10,10,0.28) 58%,
            rgba(10,10,10,0.06) 100%
          )`,
        }} />
        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-56" style={{
          background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,1))',
        }} />
        {/* Amber atmospheric glow — bottom-left */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 8% 90%, rgba(229,166,99,0.09) 0%, transparent 60%)',
        }} />
      </div>

      {/* Floating wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.7)}
        className="relative z-20 px-8 pt-10 md:px-16"
      >
        <Link href="/" className="group inline-block">
          <span className="font-serif font-medium uppercase tracking-[0.07em] text-ink-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:tracking-[0.11em] group-hover:opacity-80"
            style={{ fontSize: 'clamp(16px, 1.8vw, 20px)' }}>
            Trailfilm
          </span>
        </Link>
      </motion.div>

      {/* Hero content */}
      <motion.div
        className="relative z-20 flex flex-1 flex-col justify-end px-8 pb-20 pt-16 md:px-16 md:pb-32 lg:justify-center lg:pb-24"
        style={{ opacity: prefersReduced ? 1 : heroOpacity }}
      >

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={t(0.65, 0.1)}
          className="mb-8 flex items-center gap-3"
        >
          <div className="h-px w-8 bg-amber-accent opacity-60" />
          <span className="font-sans text-[10px] uppercase tracking-[0.26em] text-parchment-400">
            Travel journaling, reimagined with AI
          </span>
        </motion.div>

        {/* Main headline — stacked, massive, left-anchored */}
        <div className="max-w-[860px]">
          {['Your memories', 'deserve a', 'director.'].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ ...t(1.0, 0.14 + i * 0.09), ease: EASE_DRAWER }}
                className={[
                  'block font-serif font-medium uppercase leading-[0.91] tracking-[0.01em]',
                  i === 1
                    ? ''
                    : 'text-ink-50',
                ].join(' ')}
                style={{
                  fontSize: 'clamp(52px, 10vw, 118px)',
                  ...(i === 1 ? {
                    background: 'linear-gradient(135deg, #FFC881 0%, #E5A663 55%, #C49040 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : {}),
                }}
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Sub + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.85, 0.58)}
          className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between max-w-[860px]"
        >
          <p className="font-sans text-[14px] leading-[1.72] text-parchment-400 max-w-[300px]">
            Upload your photos. Get a cinematic story, an AI documentary, and a shareable animated map — automatically.
          </p>

          <div className="flex items-center gap-5 shrink-0">
            {/* Magnetic primary CTA */}
            <motion.a
              ref={magRef}
              href="/login"
              style={{ x: sx, y: sy }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-amber-accent px-7 py-3.5 font-sans text-sm font-medium text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFC881' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
            >
              <span className="relative z-10">Begin your archive</span>
              <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <ArrowUpRight />
              </span>
            </motion.a>

            <Link
              href="#story"
              className="font-sans text-[12px] text-parchment-600 underline underline-offset-4 decoration-parchment-600/30 transition-colors duration-200 hover:text-parchment-400 hover:decoration-parchment-400/40 cursor-pointer"
            >
              See a sample story
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Film-strip sprockets — right edge */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-6 z-10 hidden flex-col justify-center gap-[18px] opacity-[0.12] md:flex">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-2.5 w-1.5 rounded-[2px] bg-parchment-600" />
        ))}
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(1, 1.4)}
        className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2"
        aria-hidden
      >
        <div className="scroll-cue flex h-9 w-5 items-start justify-center rounded-full border border-parchment-600/20 pt-1.5">
          <div className="h-2 w-px rounded-full bg-parchment-600 opacity-50" />
        </div>
      </motion.div>
    </section>
  )
}

// ─── Marquee Strip ────────────────────────────────────────────────────────────
function MarqueeStrip() {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.05] py-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{
        background: 'linear-gradient(90deg, rgba(10,10,10,1) 0%, transparent 8%, transparent 92%, rgba(10,10,10,1) 100%)',
      }} />
      <div className="marquee-track flex gap-12">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-12">
            <span className="font-serif text-[10px] uppercase tracking-[0.24em] text-parchment-600 whitespace-nowrap">{item}</span>
            <span className="h-1 w-1 rounded-full bg-amber-accent/35" />
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Stacked Scroll Section ───────────────────────────────────────────────────
function StackedScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const prefersReduced = useReducedMotion()
  const revealRef = useReveal()

  return (
    <section className="relative py-24 md:py-36" ref={containerRef}>
      <div className="mx-auto max-w-7xl px-8 md:px-16">

        <div ref={revealRef} className="reveal-up mb-20 flex items-center gap-4">
          <div className="h-px w-8 bg-amber-accent/45" />
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-parchment-600">How it works</p>
        </div>

        {/* Sticky scroll stack */}
        <div className="relative" style={{ height: prefersReduced ? 'auto' : `${stackedFeatures.length * 100}vh` }}>
          <div className={prefersReduced ? 'space-y-16' : 'sticky top-16 md:top-24'}>
            {stackedFeatures.map((f, i) => (
              <StackedCard
                key={f.index}
                feature={f}
                index={i}
                total={stackedFeatures.length}
                scrollYProgress={scrollYProgress}
                prefersReduced={prefersReduced ?? false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StackedCard({
  feature, index, total, scrollYProgress, prefersReduced,
}: {
  feature: typeof stackedFeatures[0]
  index: number
  total: number
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
  prefersReduced: boolean
}) {
  const start = index / total
  const end   = (index + 1) / total

  const opacity = useTransform(scrollYProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0.4])
  const y       = useTransform(scrollYProgress, [start, end], ['40px', '0px'])
  const scale   = useTransform(scrollYProgress, [start, end], [0.96, 1])
  const { ref: imgRef, y: parallaxY } = useParallax(40)

  return (
    <motion.div
      style={prefersReduced ? {} : { opacity, y, scale }}
      className={[
        'relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]',
        'border border-white/[0.07]',
        index > 0 && !prefersReduced ? 'absolute inset-0' : '',
      ].join(' ')}
    >
      {/* Background glow */}
      <div className="absolute inset-0 z-0" style={{ background: feature.color }} />

      {/* Parallax photo */}
      <div ref={imgRef} className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
        <motion.div
          className="absolute inset-[-10%] bg-cover bg-center"
          style={{
            backgroundImage: `url('${feature.image}')`,
            y: prefersReduced ? 0 : parallaxY,
          }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(115deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 40%, rgba(10,10,10,0.18) 100%)',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 grid min-h-[480px] items-end p-10 md:min-h-[540px] md:p-14 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="mb-4 font-sans text-[9px] uppercase tracking-[0.32em] text-amber-accent/70">
            {feature.index} — {feature.eyebrow}
          </p>
          <h3
            className="font-serif font-medium uppercase leading-[0.94] text-ink-50"
            style={{ fontSize: 'clamp(30px, 4.5vw, 58px)', whiteSpace: 'pre-line' }}
          >
            {feature.headline}
          </h3>
          <p className="mt-6 font-sans text-[14px] leading-[1.75] text-parchment-400 max-w-[380px]">
            {feature.body}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px w-10 bg-white/10" />
            <div className="h-px w-5 bg-amber-accent/25" />
          </div>
        </div>
      </div>

      {/* Index pill */}
      <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-sm">
        <span className="font-sans text-[9px] uppercase tracking-[0.22em] text-parchment-600">
          {feature.index} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Bento Capabilities Grid ──────────────────────────────────────────────────
function BentoSection() {
  const headRef = useReveal()

  return (
    <section className="relative py-24 md:py-36">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(229,166,99,0.04) 0%, transparent 65%)',
      }} />

      <div className="mx-auto max-w-7xl px-8 md:px-16">
        <div ref={headRef} className="reveal-up mb-14">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-amber-accent/45" />
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-parchment-600">What you get</p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif font-medium uppercase leading-[0.94] text-ink-50"
              style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
              Four features.<br />One archive.
            </h2>
            <p className="max-w-[260px] font-sans text-[13px] leading-[1.7] text-parchment-400 md:text-right">
              Everything automatically generated from your photos. No editing. No manual steps.
            </p>
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {capabilities.map((cap, i) => (
            <BentoCard key={cap.id} cap={cap} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BentoCard({ cap, delay }: { cap: typeof capabilities[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.85, delay, ease: EASE_TRAILFILM }}
      className={['relative overflow-hidden rounded-[1.75rem] border border-white/[0.07]', cap.span].join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Double-bezel outer shell */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-[-5%] bg-cover bg-center"
          style={{ backgroundImage: `url('${cap.image}')` }}
          animate={{ scale: hovered ? 1.07 : 1.0 }}
          transition={{ duration: 0.9, ease: EASE_TRAILFILM }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.75) 100%)',
        }} />
        {/* Inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-8 md:p-9">
        <div>
          <span className="inline-block rounded-full border border-amber-accent/20 bg-amber-accent/[0.08] px-3 py-1 font-sans text-[9px] uppercase tracking-[0.22em] text-amber-accent/80">
            {cap.eyebrow}
          </span>
        </div>
        <div>
          <h3
            className="mb-3 font-serif font-medium uppercase leading-[0.95] text-ink-50"
            style={{ fontSize: 'clamp(22px, 2.8vw, 34px)', whiteSpace: 'pre-line' }}
          >
            {cap.headline}
          </h3>
          <p className="font-sans text-[13px] leading-[1.72] text-parchment-400 max-w-[360px]">
            {cap.body}
          </p>
          <div className="mt-5 flex items-center gap-2">
            <div className="h-px w-4 bg-amber-accent/25" />
            <span className="font-sans text-[10px] text-parchment-600 tracking-[0.1em]">{cap.tag}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: { value: string; label: string }[] }) {
  const ref = useReveal()
  return (
    <div className="border-y border-white/[0.05]">
      <div ref={ref} className="reveal-up mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.05] px-8 md:grid-cols-4 md:px-16">
        {stats.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center justify-center px-6 py-12 text-center"
            style={{ animationDelay: `${i * 80}ms` }}>
            <span className="font-serif font-medium text-ink-50" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
              {s.value}
            </span>
            <span className="mt-1.5 font-sans text-[10px] uppercase tracking-[0.22em] text-parchment-600">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Story Section ────────────────────────────────────────────────────────────
function StorySection() {
  const headRef = useReveal()

  return (
    <section id="story" className="relative py-24 md:py-40">
      <div className="mx-auto max-w-7xl px-8 md:px-16">

        <div ref={headRef} className="reveal-up mb-16">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-amber-accent/45" />
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-parchment-600">Sample story</p>
          </div>
          <div className="grid md:grid-cols-[1fr_auto] md:items-end md:gap-16">
            <h2 className="font-serif font-medium uppercase leading-[0.94] text-ink-50"
              style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
              This is what<br />your trip becomes.
            </h2>
            <p className="mt-6 max-w-[260px] font-sans text-[13px] leading-[1.7] text-parchment-400 md:mt-0 md:text-right">
              A real AI-generated story, from a real journey. Tone:{' '}
              <span className="text-amber-accent">Cinematic &amp; lyrical.</span>
            </p>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
          {/* Left: meta */}
          <RevealDiv className="delay-100">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6">
              <p className="mb-4 font-sans text-[9px] uppercase tracking-[0.22em] text-parchment-600">Trip details</p>
              <div className="space-y-3">
                {[
                  ['Destination', 'Atacama Desert, Chile'],
                  ['Duration',    '11 days'],
                  ['Photos',      '94 uploaded'],
                  ['Chapters',    '4 generated'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <span className="font-sans text-[11px] text-parchment-600">{k}</span>
                    <span className="font-sans text-[11px] text-parchment-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-accent/10 bg-amber-accent/[0.04] p-5">
              <p className="font-sans text-[11px] leading-[1.7] text-parchment-400">
                &ldquo;Tone: cinematic, lyrical. Generated from 94 images. 4 chapters, 3,200 words. Plus an AI documentary and animated map.&rdquo;
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
                <div className="absolute inset-0 rounded-2xl" style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.9) 50%, rgba(10,10,10,1) 100%)',
                }} />
                <div className="absolute inset-x-0 bottom-5 flex items-center justify-center">
                  <Link href="/login" className="font-sans text-[11px] text-parchment-600 transition-colors duration-200 hover:text-amber-accent cursor-pointer">
                    2 more chapters · start your own story →
                  </Link>
                </div>
              </div>
            </RevealDiv>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── World Map Section ────────────────────────────────────────────────────────
function WorldMapSection() {
  const headRef = useReveal()
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const isInView = useInView(headlineRef, { once: true, margin: '-80px' })
  const prefersReduced = useReducedMotion()
  const headline = 'Journeys archived across the world.'

  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(ellipse 90% 60% at 50% 50%, rgba(229,166,99,0.04) 0%, transparent 65%)',
      }} />
      <div className="mx-auto max-w-7xl px-8 md:px-16">
        <div ref={headRef} className="reveal-up mb-14">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-amber-accent/45" />
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-parchment-600">The archive</p>
          </div>
          <div className="grid md:grid-cols-[1fr_auto] md:items-end md:gap-16">
            <h2
              ref={headlineRef}
              className="font-serif font-medium uppercase leading-[0.94] text-ink-50"
              style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
            >
              {prefersReduced ? headline : (
                headline.split('').map((char, i) =>
                  char === ' ' ? (
                    <motion.span key={i} style={{ display: 'inline-block', width: '0.3em' }} />
                  ) : (
                    <motion.span
                      key={i}
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: i * 0.028, ease: EASE_TRAILFILM }}
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

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  const ref = useReveal()
  const { ref: magRef, sx, sy } = useMagnetic(0.3)

  return (
    <section className="relative py-24 md:py-36">
      <div ref={ref} className="reveal-up mx-auto max-w-7xl px-8 md:px-16">

        {/* Double-bezel CTA card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] p-1.5 md:rounded-[2.5rem]"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="relative overflow-hidden rounded-[calc(2rem-6px)] md:rounded-[calc(2.5rem-6px)]">

            {/* BG photo */}
            <div className="absolute inset-0 bg-cover bg-center scale-[1.04]" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1800&q=85&auto=format&fit=crop')`,
            }} />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.74) 45%, rgba(10,10,10,0.52) 100%)',
            }} />
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 55% 65% at 4% 96%, rgba(229,166,99,0.11) 0%, transparent 58%)',
            }} />
            {/* Inner top highlight */}
            <div className="absolute inset-x-0 top-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
            }} />

            {/* Film strip top */}
            <div aria-hidden className="absolute inset-x-0 top-5 flex justify-center gap-3 opacity-[0.09]">
              {Array.from({ length: 14 }).map((_, i) => <div key={i} className="h-1.5 w-3 rounded-sm bg-parchment-600" />)}
            </div>

            <div className="relative z-10 px-10 py-16 md:px-16 md:py-24 lg:px-24">
              <div className="grid md:grid-cols-[1fr_auto] md:items-end md:gap-16">
                <div>
                  <p className="mb-6 font-sans text-[10px] uppercase tracking-[0.28em] text-parchment-600">Begin your archive</p>
                  <h2 className="font-serif font-medium uppercase leading-[0.92] text-ink-50"
                    style={{ fontSize: 'clamp(38px, 7vw, 82px)' }}>
                    Every journey<br />
                    <span style={{
                      background: 'linear-gradient(135deg, #FFC881 0%, #E5A663 60%, #B07F40 100%)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                      deserves a story.
                    </span>
                  </h2>
                </div>
                <div className="mt-10 flex flex-col items-start gap-5 md:mt-0 md:items-end">
                  <p className="font-sans text-[13px] leading-[1.7] text-parchment-400 md:text-right max-w-[240px]">
                    Free to start. No credit card. Your first trip story in under five minutes.
                  </p>
                  <motion.a
                    ref={magRef}
                    href="/login"
                    style={{ x: sx, y: sy }}
                    whileTap={{ scale: 0.97 }}
                    className="group inline-flex items-center gap-3 rounded-full bg-amber-accent px-7 py-3.5 font-sans text-sm font-medium text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-ink"
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FFC881'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
                  >
                    <span>Create your account</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                      <ArrowUpRight />
                    </span>
                  </motion.a>
                  <p className="font-sans text-[11px] text-parchment-600">
                    Built for wherever the road takes you.
                  </p>
                </div>
              </div>
            </div>

            {/* Film strip bottom */}
            <div aria-hidden className="absolute inset-x-0 bottom-5 flex justify-center gap-3 opacity-[0.09]">
              {Array.from({ length: 14 }).map((_, i) => <div key={i} className="h-1.5 w-3 rounded-sm bg-parchment-600" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/[0.05] py-14">
      <div className="mx-auto max-w-7xl px-8 md:px-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="font-serif font-medium uppercase tracking-[0.07em] text-ink-50" style={{ fontSize: '18px' }}>
              Trailfilm
            </span>
            <p className="mt-2 font-sans text-[12px] text-parchment-600">
              Your memories deserve a director.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            {[['Log in', '/login'], ['Sign up', '/login'], ['Privacy', '#'], ['Terms', '#']].map(([label, href]) => (
              <Link key={label} href={href}
                className="font-sans text-[12px] text-parchment-600 transition-colors duration-200 hover:text-parchment-400 cursor-pointer">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[0.06, 0.18, 0.55, 1, 0.55, 0.18, 0.06].map((op, i) => (
              <div key={i} className="h-px w-7 bg-parchment-600" style={{ opacity: op }} />
            ))}
          </div>
          <p className="font-sans text-[11px] text-parchment-600 opacity-40">
            &copy; {new Date().getFullYear()} Trailfilm
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function RevealDiv({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal()
  return <div ref={ref} className={`reveal-up ${className}`}>{children}</div>
}

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

function ArrowUpRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5v5.5" />
    </svg>
  )
}
