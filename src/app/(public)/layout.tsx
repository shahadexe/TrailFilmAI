import type { ReactNode } from 'react'
import { Fraunces, Inter } from 'next/font/google'
import '../globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${inter.variable}`}>
      {children}
    </div>
  )
}
