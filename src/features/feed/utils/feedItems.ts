import type { Spot } from '@/features/spots/types'
import type { FeedEvent } from '@/shared/types'

/**
 * Item da lista do feed. O discriminador existe porque as duas entidades vêm de
 * endpoints diferentes (/feed e /spots) e compartilham a mesma FlatList — sem
 * ele, `id` de evento e `id` de rolê disputariam a mesma chave.
 */
export type FeedItem =
  | { type: 'spot'; key: string; spot: Spot }
  | { type: 'event'; key: string; event: FeedEvent }

/**
 * Monta a lista: os rolês perto de você abrem o feed (é conteúdo perecível —
 * daqui a duas horas não existe mais), os eventos seguem na ordem que o
 * backend mandou. Nenhuma das duas ordens é recalculada aqui.
 */
export function toFeedItems(events: FeedEvent[], spots: Spot[]): FeedItem[] {
  const spotItems = spots
    // Defensivo: /spots já filtra cancelados, mas um rolê cancelado entre o
    // fetch e o render não pode aparecer como convite válido.
    .filter(spot => !spot.canceledAt)
    .map<FeedItem>(spot => ({ type: 'spot', key: `spot-${spot.id}`, spot }))

  const eventItems = events.map<FeedItem>(event => ({
    type: 'event',
    key: `event-${event.id}`,
    event,
  }))

  return [...spotItems, ...eventItems]
}
