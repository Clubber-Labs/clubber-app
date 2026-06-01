import { api } from '@/shared/lib/api'
import type {
  CursorPaginatedResponse,
  EventStatus,
  FeedEvent,
} from '@/shared/types'

type FeedParams = {
  cursor?: string
  status?: EventStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
  // Default no backend é true em /feed (mostra passados pra preservar contexto
  // social de interações de amigos). Diferente de /events, que default é false.
  includePast?: boolean
  // Localização do device para a descoberta por proximidade. Regra
  // ambos-ou-nenhum (garantida pelo caller); radiusKm só com near.
  nearLat?: number
  nearLng?: number
  radiusKm?: number
}

export const feedService = {
  getFeed: ({
    cursor,
    status,
    category,
    dateFrom,
    dateTo,
    includePast,
    nearLat,
    nearLng,
    radiusKm,
  }: FeedParams = {}): Promise<CursorPaginatedResponse<FeedEvent>> =>
    api
      .get('/feed', {
        params: {
          limit: 20,
          // cursor é token opaco (base64url): reenviado literalmente, nunca
          // construído nem validado como UUID.
          ...(cursor ? { cursor } : {}),
          ...(status?.length ? { status } : {}),
          ...(category?.length ? { category } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
          ...(includePast !== undefined ? { includePast } : {}),
          ...(nearLat !== undefined && nearLng !== undefined
            ? { nearLat, nearLng }
            : {}),
          ...(radiusKm !== undefined ? { radiusKm } : {}),
        },
        // Backend espera array repetido (status=A&status=B), não brackets.
        paramsSerializer: { indexes: null },
      })
      .then(r => r.data),
}
