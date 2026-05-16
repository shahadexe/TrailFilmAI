'use client'

import { Toaster } from '@/components/ui/sonner'

export const ToasterProvider = () => {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-ink-800 border border-ink-700 text-ink-50 font-sans text-sm',
        },
      }}
    />
  )
}
