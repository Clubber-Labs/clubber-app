import type { Spot } from '@/features/spots/types'
import type {
  CursorPaginatedResponse,
  FeedEvent,
  FeedReason,
} from '@/shared/types'

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

/**
 * Total elegível por pool, para a contagem das abas de tipo. Cada campo é
 * opcional de propósito: o backend ainda não manda `counts`, e a aba precisa
 * continuar desenhando só o rótulo quando o número não vier.
 *
 * CONTRATO: os totais são GLOBAIS por pool, nunca escopados ao `kinds` pedido —
 * a aba Eventos precisa saber quantos rolês existem, e vice-versa. O useFeed
 * segura o último `counts` conhecido entre trocas de aba justamente por isso;
 * se um dia o backend escopar o campo à request, aquele valor congela.
 */
export type FeedCounts = {
  events?: number
  spots?: number
}

export type FeedPage = CursorPaginatedResponse<FeedItem> & {
  counts?: FeedCounts
}
