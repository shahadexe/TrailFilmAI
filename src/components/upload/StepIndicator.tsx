'use client'

interface StepIndicatorProps {
  step: 1 | 2
}

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="font-sans text-xs font-medium uppercase tracking-[0.05em] text-parchment-400"
    >
      Step {step} of 2
    </p>
  )
}
