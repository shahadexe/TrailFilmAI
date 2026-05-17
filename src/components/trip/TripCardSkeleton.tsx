import { Skeleton } from '@/components/ui/skeleton'

export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-700 bg-ink-800">
      <Skeleton className="aspect-video w-full bg-ink-700 rounded-none" />
      <div className="px-4 py-3 flex flex-col gap-1">
        <Skeleton className="h-4 w-3/4 bg-ink-700 rounded" />
        <Skeleton className="h-3 w-1/2 bg-ink-700 rounded" />
      </div>
    </div>
  )
}
