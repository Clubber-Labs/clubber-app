import type { Spot } from '@/features/spots/types'
import type { FeedEvent, FeedReason } from '@/shared/types'

/**
 * Filtro de tipo do feed. EVENTS é o default do backend (preserva o contrato
 * antigo); rolês só entram na mescla quando o feed manda nearLat/nearLng — sem
 * localização, ALL devolve só eventos, e isso não é erro.
 */
export type FeedKind = 'EVENTS' | 'SPOTS' | 'ALL'

/**
 * Item da resposta do /feed. O discriminador vem do backend, que ranqueia as
 * duas pools numa escala única e devolve a ordem final — o client não reordena
 * nem reagrupa, só decide qual card desenhar.
 */
export type FeedItem =
  | ({ type: 'EVENT' } & FeedEvent)
  | ({ type: 'SPOT'; reason?: FeedReason } & Spot)
