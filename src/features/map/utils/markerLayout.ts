import type { FeedEvent } from '@/shared/types'

const COINCIDENT_GRID = 0.0001

/**
 * Agrupa eventos coincidentes via bucket por coordenada quantizada.
 * Complexidade O(n). Eventos isolados aparecem em grupos de tamanho 1.
 *
 * Edge case conhecido: dois pontos em lados opostos de uma fronteira de
 * grid acabam em buckets diferentes. Não ocorre com geocoding real porque
 * o mesmo endereço gera coordenadas idênticas.
 */
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

/**
 * Calcula o offset em pixels (na tela) de um marker dentro de um grupo
 * coincidente, espalhando-os em círculo. Para grupos de 1, retorna {0,0}.
 */
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

/**
 * Raio mínimo do círculo de fanout pra evitar sobreposição entre N pins.
 * Garante distância mínima de (pinSize + gap) entre centros adjacentes.
 */
export function fanoutRadius(
  total: number,
  pinSize: number,
  gap: number,
): number {
  if (total <= 1) return 0
  return (pinSize + gap) / (2 * Math.sin(Math.PI / total))
}
