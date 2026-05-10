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
}

export const feedService = {
  getFeed: ({
    cursor,
    status,
    category,
    dateFrom,
    dateTo,
    includePast,
  }: FeedParams = {}): Promise<CursorPaginatedResponse<FeedEvent>> =>
    api
      .get('/feed', {
        params: {
          limit: 20,
          ...(cursor ? { cursor } : {}),
          ...(status?.length ? { status } : {}),
          ...(category?.length ? { category } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
          ...(includePast !== undefined ? { includePast } : {}),
        },
        // Backend espera array repetido (status=A&status=B), não brackets.
        paramsSerializer: { indexes: null },
      })
      .then(r => r.data),
}
