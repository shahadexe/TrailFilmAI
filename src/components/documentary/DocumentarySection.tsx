'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Film, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { DocumentaryPlayer } from './DocumentaryPlayer'

interface DocumentarySectionProps {
  tripId: string
  tripTitle: string
  photoCount: number
  existingDocumentaryId?: string | null
}

type UIState =
  | { phase: 'idle' }
  | { phase: 'generating'; message: string; pct: number }
  | { phase: 'player'; videoUrls: string[]; sceneTitles: string[]; documentaryId: string }
  | { phase: 'error'; message: string }

const POLL_INTERVAL = 4000

const ease = [0.22, 1, 0.36, 1] as const

const GENERATION_MESSAGES = [
  'Analyzing your photos with Gemini 2.5 Flash…',
  'Crafting cinematic scene descriptions…',
  'Generating video scenes with Kling AI…',
  'Rendering cinematic moments…',
  'Assembling your documentary…',
]

export function DocumentarySection({
  tripId,
  tripTitle,
  photoCount,
  existingDocumentaryId,
}: DocumentarySectionProps) {
  const [state, setState] = useState<UIState>({ phase: 'idle' })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const msgIndexRef = useRef(0)
  const msgTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const dur = prefersReducedMotion ? 0 : 0.7

  // Load existing documentary on mount
  useEffect(() => {
    if (!existingDocumentaryId) return
    fetchStatus(existingDocumentaryId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingDocumentaryId])

  const clearPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (msgTimerRef.current) { clearInterval(msgTimerRef.current); msgTimerRef.current = null }
  }, [])

  useEffect(() => () => clearPolling(), [clearPolling])

  async function fetchStatus(documentaryId: string) {
    try {
      const res = await fetch(`/api/documentary/${documentaryId}/status`)
      if (!res.ok) return

      const data = await res.json() as {
        status: string
        videoUrls: string[]
        sceneTitles: string[]
        errorMessage: string | null
      }

      if (data.status === 'completed' && data.videoUrls.length > 0) {
        clearPolling()
        setState({
          phase: 'player',
          videoUrls: data.videoUrls,
          sceneTitles: data.sceneTitles,
          documentaryId,
        })
      } else if (data.status === 'failed') {
        clearPolling()
        setState({ phase: 'error', message: data.errorMessage ?? 'Generation failed.' })
      }
    } catch {
      // Swallow network errors during polling
    }
  }

  function startMessageRotation() {
    msgIndexRef.current = 0
    setState((prev) =>
      prev.phase === 'generating'
        ? prev
        : { phase: 'generating', message: GENERATION_MESSAGES[0], pct: 5 }
    )

    msgTimerRef.current = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % GENERATION_MESSAGES.length
      const pct = Math.min(5 + msgIndexRef.current * 18, 90)
      setState((prev) =>
        prev.phase === 'generating'
          ? { ...prev, message: GENERATION_MESSAGES[msgIndexRef.current], pct }
          : prev
      )
    }, 4500)
  }

  const handleGenerate = useCallback(async () => {
    setState({ phase: 'generating', message: GENERATION_MESSAGES[0], pct: 5 })
    startMessageRotation()

    try {
      const res = await fetch('/api/documentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        clearPolling()
        setState({ phase: 'error', message: err.error ?? 'Failed to start generation.' })
        return
      }

      const data = await res.json() as { documentaryId: string }
      const { documentaryId } = data

      // Start polling
      pollRef.current = setInterval(() => fetchStatus(documentaryId), POLL_INTERVAL)
    } catch (err) {
      clearPolling()
      setState({ phase: 'error', message: String(err) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  return (
    <section className="mt-12">
      {/* Section header */}
      <motion.div
        className="mb-6 flex items-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease }}
      >
        <div className="w-8 h-8 rounded-lg bg-[rgba(229,166,99,0.08)] border border-[rgba(229,166,99,0.15)] flex items-center justify-center">
          <Film size={16} strokeWidth={1.5} className="text-amber-accent" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-medium text-ink-50 tracking-[-0.01em]">
            AI Documentary
          </h2>
          <p className="font-sans text-xs text-parchment-600 mt-0.5">
            Gemini 2.5 Flash + Kling AI · {photoCount} photo{photoCount !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {state.phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: dur, ease }}
            className="surface-card rounded-2xl p-6 border border-[rgba(255,255,255,0.06)]"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'radial-gradient(circle, rgba(229,166,99,0.12) 0%, rgba(229,166,99,0.04) 100%)',
                  border: '1px solid rgba(229,166,99,0.15)',
                }}
              >
                <Sparkles size={20} strokeWidth={1.5} className="text-amber-accent" />
              </div>
              <div className="flex-1">
                <p className="font-sans text-sm text-parchment-200 leading-relaxed">
                  Transform your {photoCount} photo{photoCount !== 1 ? 's' : ''} into a breathtaking cinematic documentary. Veo 2 generates immersive video scenes from each moment of your journey.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Cinematic video', 'AI scene direction', 'Veo 2 generation'].map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[11px] text-parchment-600 px-2 py-1 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={photoCount === 0}
              className={[
                'mt-5 w-full flex items-center justify-center gap-2 h-11 rounded-xl font-sans text-sm font-medium',
                'bg-amber-accent text-ink transition-all duration-200',
                'hover:bg-amber-bright hover:-translate-y-px hover:shadow-[0_8px_24px_-6px_rgba(229,166,99,0.4)]',
                'active:scale-[0.98] active:bg-amber-deep',
                'disabled:opacity-40 disabled:cursor-not-allowed',
              ].join(' ')}
            >
              <Sparkles size={15} strokeWidth={2} />
              Create Documentary
            </button>
          </motion.div>
        )}

        {state.phase === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: dur, ease }}
            className="surface-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[rgba(229,166,99,0.08)] flex items-center justify-center">
                <Sparkles size={15} strokeWidth={1.5} className="text-amber-accent animate-spin" style={{ animationDuration: '2s' }} />
              </div>
              <p className="font-sans text-sm text-parchment-200">
                {state.message}
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden relative">
              <div
                className="absolute left-0 top-0 h-full w-1/3 bg-amber-accent rounded-full progress-indeterminate"
              />
            </div>

            <p className="mt-3 font-sans text-[11px] text-parchment-600">
              Veo 2 generation takes 2–5 minutes. You can leave this page.
            </p>
          </motion.div>
        )}

        {state.phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: dur, ease }}
            className="surface-card rounded-2xl p-5 border border-[rgba(214,120,103,0.2)]"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={16} strokeWidth={1.5} className="text-error mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-sans text-sm text-parchment-200">
                  {state.message}
                </p>
                <button
                  onClick={handleGenerate}
                  className="mt-3 flex items-center gap-1.5 font-sans text-xs text-amber-accent hover:text-amber-bright transition-colors"
                >
                  <RefreshCw size={12} strokeWidth={2} />
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state.phase === 'player' && (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: dur, ease }}
          >
            <DocumentaryPlayer
              videoUrls={state.videoUrls}
              sceneTitles={state.sceneTitles}
              tripTitle={tripTitle}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setState({ phase: 'idle' })}
                className="font-sans text-xs text-parchment-600 hover:text-amber-accent transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={11} strokeWidth={2} />
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
