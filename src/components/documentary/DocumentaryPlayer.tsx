'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'

interface DocumentaryPlayerProps {
  videoUrls: string[]
  sceneTitles: string[]
  tripTitle: string
  onClose?: () => void
}

const ease = [0.22, 1, 0.36, 1] as const

export function DocumentaryPlayer({
  videoUrls,
  sceneTitles,
  tripTitle,
  onClose,
}: DocumentaryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [showTitle, setShowTitle] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const dur = prefersReducedMotion ? 0 : 0.5

  const currentUrl = videoUrls[currentIndex]
  const currentTitle = sceneTitles[currentIndex] ?? ''
  const totalScenes = videoUrls.length

  // Auto-advance to next scene
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleEnded() {
      if (currentIndex < totalScenes - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        setIsPlaying(false)
      }
    }

    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [currentIndex, totalScenes])

  // Play/pause sync
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false))
    } else {
      video.pause()
    }
  }, [isPlaying])

  // Scene change → reset + autoplay
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.load()
    if (isPlaying) {
      video.play().catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleTimeUpdate() {
      if (!video) return
      const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0
      setProgress(pct)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [])

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    setShowControls(true)
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [])

  // Title auto-hide
  useEffect(() => {
    setShowTitle(true)
    const t = setTimeout(() => setShowTitle(false), 3500)
    return () => clearTimeout(t)
  }, [currentIndex])

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
    resetControlsTimer()
  }, [resetControlsTimer])

  const goNext = useCallback(() => {
    if (currentIndex < totalScenes - 1) {
      setCurrentIndex((i) => i + 1)
      resetControlsTimer()
    }
  }, [currentIndex, totalScenes, resetControlsTimer])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      resetControlsTimer()
    }
  }, [currentIndex, resetControlsTimer])

  const seekTo = useCallback((pct: number) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    video.currentTime = (pct / 100) * video.duration
    resetControlsTimer()
  }, [resetControlsTimer])

  const handleFullscreen = useCallback(() => {
    const el = document.documentElement
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  return (
    <div
      className="relative w-full bg-ink overflow-hidden"
      style={{ aspectRatio: '9/16', maxHeight: '90dvh', maxWidth: '500px', margin: '0 auto' }}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* Grain overlay */}
      <div className="grain-overlay pointer-events-none absolute inset-0 z-20 opacity-[0.025]" />

      {/* Video */}
      <video
        ref={videoRef}
        key={currentUrl}
        className="absolute inset-0 w-full h-full object-cover"
        src={currentUrl}
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        style={{ cursor: 'pointer' }}
      />

      {/* Scene title overlay */}
      <AnimatePresence>
        {showTitle && currentTitle && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-10 p-5"
            style={{
              background: 'linear-gradient(to bottom, rgba(10,10,10,0.75) 0%, transparent 100%)',
            }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: dur, ease }}
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-amber-accent mb-1">
              Scene {currentIndex + 1} / {totalScenes}
            </p>
            <h2 className="font-serif text-lg font-medium text-ink-50 leading-tight">
              {currentTitle}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene subtitle bar — ROADMAP locked spec */}
      {currentTitle && (
        <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center px-4 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle}
              className="font-sans text-sm text-parchment-200 bg-ink/70 backdrop-blur-sm px-3 py-1 rounded-md subtitle-enter"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: dur * 0.6, ease }}
            >
              {currentTitle}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-10"
            style={{
              background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur * 0.6 }}
          >
            {/* Progress bar */}
            <div
              className="mx-4 mb-3 h-0.5 bg-[rgba(255,255,255,0.12)] rounded-full cursor-pointer relative overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                seekTo(((e.clientX - rect.left) / rect.width) * 100)
              }}
            >
              <div
                className="absolute left-0 top-0 h-full bg-amber-accent rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 px-4 pb-4">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="w-9 h-9 flex items-center justify-center text-parchment-400 hover:text-ink-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>

              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-amber-accent flex items-center justify-center text-ink hover:bg-amber-bright active:scale-95 transition-all duration-200 shadow-[0_0_16px_rgba(229,166,99,0.4)]"
              >
                {isPlaying
                  ? <Pause size={18} strokeWidth={2} />
                  : <Play size={18} strokeWidth={2} style={{ transform: 'translateX(1px)' }} />
                }
              </button>

              <button
                onClick={goNext}
                disabled={currentIndex === totalScenes - 1}
                className="w-9 h-9 flex items-center justify-center text-parchment-400 hover:text-ink-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>

              <div className="flex-1" />

              <button
                onClick={() => setIsMuted((m) => !m)}
                className="w-9 h-9 flex items-center justify-center text-parchment-400 hover:text-ink-50 transition-colors"
              >
                {isMuted
                  ? <VolumeX size={16} strokeWidth={1.5} />
                  : <Volume2 size={16} strokeWidth={1.5} />
                }
              </button>

              <button
                onClick={handleFullscreen}
                className="w-9 h-9 flex items-center justify-center text-parchment-400 hover:text-ink-50 transition-colors"
              >
                <Maximize2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene dots */}
      <div className="absolute top-4 right-4 z-10 flex gap-1">
        {videoUrls.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); resetControlsTimer() }}
            className={[
              'w-1.5 h-1.5 rounded-full transition-all duration-300',
              i === currentIndex
                ? 'bg-amber-accent w-4'
                : 'bg-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.5)]',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Play indicator on tap */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur * 0.4 }}
          >
            <div className="w-16 h-16 rounded-full bg-ink/60 backdrop-blur-sm flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
              <Play size={24} className="text-amber-accent" style={{ transform: 'translateX(2px)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
