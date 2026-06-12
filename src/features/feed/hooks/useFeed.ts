import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { feedService } from '../services/feedService'
import { normalizeFilters } from '@/shared/utils/normalizeFilters'
import type { EventStatus } from '@/shared/types'

type Filters = {
  status?: EventStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
  includePast?: boolean
  // Proximidade: enviar ambos ou nenhum. radiusKm só faz sentido com near.
  nearLat?: number
  nearLng?: number
  radiusKm?: number
}

type Options = {
  enabled?: boolean
}

export function useFeed(
  filters: Filters = {},
  { enabled = true }: Options = {},
) {
  // Normaliza pra que {} e {status: undefined} compartilhem a mesma queryKey
  // (sem normalizar, geram hashes distintos → cache duplicado). Memoiza pra
  // estabilizar referência entre renders quando o filtro lógico não muda.
  // near* entram na queryKey: mudar de localização reinicia a paginação.
  const normalized = useMemo(() => normalizeFilters(filters), [filters])

  return useInfiniteQuery({
    queryKey: ['feed', normalized],
    queryFn: ({ pageParam }) =>
      feedService.getFeed({ cursor: pageParam, ...normalized }),
    initialPageParam: undefined as string | undefined,
    // cursor é token opaco: parar quando vier null (inclui cursor antigo/expirado,
    // que o backend responde com data:[] e nextCursor:null — fim, não erro).
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
    enabled,
  })
}
