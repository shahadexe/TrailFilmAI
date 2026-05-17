'use client'

const radius = 20
const circumference = 2 * Math.PI * radius

export interface PhotoProgressRingProps {
  progress: number
  filename: string
}

export function PhotoProgressRing({ progress, filename }: PhotoProgressRingProps) {
  const dashOffset = circumference - (progress / 100) * circumference

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 44 44"
      className="absolute inset-0 m-auto z-10"
      role="progressbar"
      aria-label={`Uploading ${filename}`}
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Track circle */}
      <circle cx="22" cy="22" r={radius} fill="none" stroke="#1F1F1F" strokeWidth="3" />
      {/* Arc circle */}
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="#E5A663"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 200ms linear' }}
        transform="rotate(-90 22 22)"
      />
    </svg>
  )
}
