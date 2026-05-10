import type { FeedEvent } from '@/shared/types'

const COINCIDENT_GRID = 0.0001

export function groupCoincidentEvents(events: FeedEvent[]): FeedEvent[][] {
  const buckets = new Map<string, FeedEvent[]>()
  for (const event of events) {
    const key = bucketKey(event.longitude, event.latitude)
    const bucket = buckets.get(key)
    if (bucket) bucket.push(event)
    else buckets.set(key, [event])
  }
  return Array.from(buckets.values())
}

function bucketKey(lng: number, lat: number): string {
  const x = Math.round(lng / COINCIDENT_GRID)
  const y = Math.round(lat / COINCIDENT_GRID)
  return `${x}|${y}`
}

export function fanoutOffset(
  index: number,
  total: number,
  radius: number,
): { x: number; y: number } {
  if (total <= 1) return { x: 0, y: 0 }
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

export function fanoutRadius(
  total: number,
  pinSize: number,
  gap: number,
): number {
  if (total <= 1) return 0
  return (pinSize + gap) / (2 * Math.sin(Math.PI / total))
}
