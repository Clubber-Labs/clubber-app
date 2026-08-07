import type { FeedEvent } from '@/shared/types'

// ── Geometria da gota (EventPin do zoom alto + imagens de pin do zoom baixo) ──

const PIN_TAIL_RATIO = 0.26
// Contorno escuro sutil na casca: define a silhueta nos lightPresets claros
// (day/dawn), onde branco sobre chão claro some; à noite é imperceptível.
export const PIN_RIM_WIDTH = 1.6
export const PIN_RIM_COLOR = 'rgba(0,0,0,0.30)'

export function pinTailHeight(size: number): number {
  return Math.round(size * PIN_TAIL_RATIO)
}

// Afunilamento da gota: começa no equador do círculo com tangente vertical
// (une sem degrau) e converge em curva até a ponta, que marca a coordenada
// exata do evento. `grow` expande a silhueta pro contorno do rim.
export function pinTailPath(size: number, grow = 0): string {
  const r = size / 2
  const tipY = size + pinTailHeight(size) + grow
  const ctrlY = r + (tipY - r) * 0.5
  return [
    `M ${-grow} ${r}`,
    `Q ${-grow} ${ctrlY} ${r} ${tipY}`,
    `Q ${size + grow} ${ctrlY} ${size + grow} ${r}`,
    'Z',
  ].join(' ')
}

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

// Pilha de avatares na base da CABEÇA da gota, deslocada um passo pra direita
// pra não cobrir o rabinho. `anchor` mantém a PONTA da gota sobre a coordenada
// do evento. `friendTop` deixa o topo levemente escondido sob a cabeça. Item i
// fica em x = firstAvatarX + i*step (centro do avatar).
export function friendStackLayout(
  pinSize: number,
  tailHeight: number,
  count: number,
): {
  avatarSize: number
  step: number
  firstAvatarX: number
  friendTop: number
  frameWidth: number
  frameHeight: number
  anchor: { x: number; y: number }
} {
  const avatarSize = FRIEND_AVATAR_SIZE
  const step = FRIEND_OVERLAP_STEP
  const pinCenterX = pinSize / 2
  const firstAvatarX = pinCenterX + step
  const rightEdge = firstAvatarX + (count - 1) * step + avatarSize / 2
  const frameWidth = Math.max(pinSize, rightEdge)
  const friendTop = pinSize - FRIEND_TUCK
  const pinHeight = pinSize + tailHeight
  const frameHeight = Math.max(pinHeight, friendTop + avatarSize)
  return {
    avatarSize,
    step,
    firstAvatarX,
    friendTop,
    frameWidth,
    frameHeight,
    anchor: { x: pinCenterX / frameWidth, y: pinHeight / frameHeight },
  }
}
