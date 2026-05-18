'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { deleteTrip } from '@/lib/trips/mutations'

export interface DeleteTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string | null
  onDeleted: (tripId: string) => void
}

export function DeleteTripDialog({
  open,
  onOpenChange,
  tripId,
  onDeleted,
}: DeleteTripDialogProps) {
  const [pending, setPending] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (!tripId) return

    setPending(true)
    try {
      const supabase = createClient()
      const { data: photoRows } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('trip_id', tripId)
      await deleteTrip(supabase, tripId, photoRows ?? [])
      toast.success('Trip deleted.')
      onDeleted(tripId)
      onOpenChange(false)
    } catch (err) {
      console.error('[DeleteTripDialog] deletion failed:', err)
      toast.error("Couldn't delete trip. Try again.")
    } finally {
      setPending(false)
    }
  }, [tripId, onDeleted, onOpenChange])

  const handleCancel = useCallback(() => {
    if (pending) return
    onOpenChange(false)
  }, [pending, onOpenChange])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="bg-ink-800 border border-ink-700 rounded-[10px] max-w-[400px] p-6 shadow-none gap-0">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink-50">
            Delete this trip?
          </DialogTitle>
          <DialogDescription className="font-sans text-base text-parchment-200 leading-normal">
            This removes all photos and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            aria-disabled={pending}
            className="min-h-[44px] rounded-md border border-ink-500 bg-transparent px-5 py-2 font-sans text-sm font-medium text-ink-50 transition-colors duration-300 ease-trailfilm hover:bg-ink-800 hover:border-parchment-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            aria-busy={pending}
            aria-disabled={pending}
            className="min-w-[120px] min-h-[44px] rounded-md border border-error bg-transparent px-5 py-2 font-sans text-sm font-medium text-error transition-colors duration-300 ease-trailfilm hover:bg-error/10 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-label="Deleting" />
            ) : (
              'Delete trip'
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
