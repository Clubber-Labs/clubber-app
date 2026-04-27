import type { FeedEvent } from '@/shared/types'
import { MAX_ZOOM } from '../constants'

export function computeClusterZoom(
  events: FeedEvent[],
  center: [number, number],
  currentZoom: number,
): number {
  const [lng, lat] = center
  const spread = Math.max(
    ...events.map(e =>
      Math.max(Math.abs(e.longitude - lng), Math.abs(e.latitude - lat)),
    ),
    0.0001,
  )
  return Math.min(
    Math.max(Math.log2(360 / spread) - 2, currentZoom + 2),
    MAX_ZOOM,
  )
}
