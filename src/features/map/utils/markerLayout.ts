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

const FRIEND_AVATAR_SIZE = 28
const FRIEND_OVERLAP_STEP = FRIEND_AVATAR_SIZE * 0.6
const FRIEND_TUCK = FRIEND_AVATAR_SIZE * 0.28

// Pilha de avatares de amigos na BASE do pin: começa no centro e vai pra direita,
// sobrepostos (face-pile). `anchor` mantém o CENTRO DO PIN sobre a coordenada do
// evento, com os amigos pendurados abaixo. `friendTop` deixa o topo levemente
// escondido sob o pin. Item i fica em x = centerX + i*step (centro do avatar).
export function friendStackLayout(
  pinSize: number,
  count: number,
): {
  avatarSize: number
  step: number
  centerX: number
  friendTop: number
  frameWidth: number
  frameHeight: number
  anchor: { x: number; y: number }
} {
  const avatarSize = FRIEND_AVATAR_SIZE
  const step = FRIEND_OVERLAP_STEP
  const centerX = pinSize / 2
  const rightEdge = centerX + (count - 1) * step + avatarSize / 2
  const frameWidth = Math.max(pinSize, rightEdge)
  const friendTop = pinSize - FRIEND_TUCK
  const frameHeight = friendTop + avatarSize
  return {
    avatarSize,
    step,
    centerX,
    friendTop,
    frameWidth,
    frameHeight,
    anchor: { x: centerX / frameWidth, y: pinSize / 2 / frameHeight },
  }
}
