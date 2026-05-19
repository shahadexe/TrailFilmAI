'use client'
import { usePathname } from 'next/navigation'
import { AppNav } from './AppNav'

export function AppNavWrapper({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  // Suppress AppNav on trip detail pages — ViewerNav renders its own header
  if (/^\/trip\/[^/]+$/.test(pathname)) return null
  return <AppNav userEmail={userEmail} />
}
