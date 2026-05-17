import { format } from 'date-fns'

export function formatExifTimestamp(date: Date): string {
  return format(date, 'd MMM yyyy · HH:mm')
}
