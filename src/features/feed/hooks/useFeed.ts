import { useMemo, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { feedService } from '../services/feedService'
import { normalizeFilters } from '@/shared/utils/normalizeFilters'
import type { FeedCounts, FeedKind } from '../types'
import type { EventStatus } from '@/shared/types'

type Filters = {
  status?: EventStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
  includePast?: boolean
  // Eventos, rolês ou a mescla. Entra na queryKey: trocar o filtro é outra
  // lista, com outro ranking e outro cursor.
  kinds?: FeedKind
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

  const query = useInfiniteQuery({
    queryKey: ['feed', normalized],
    queryFn: ({ pageParam }) =>
      feedService.getFeed({ cursor: pageParam, ...normalized }),
    initialPageParam: undefined as string | undefined,
    // cursor é token opaco: parar quando vier null (inclui cursor antigo/expirado,
    // que o backend responde com data:[] e nextCursor:null — fim, não erro).
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
    // Sem keepPreviousData de propósito: segurar a aba anterior parecia
    // travamento (toque sem resposta visual) e adiava o custo pra chegada dos
    // dados — desmonte e monte de TODOS os cards num frame só, o engasgo.
    // Trocar de aba mostra o FeedSkeleton na hora e os cards entram em lotes.
    enabled,
  })

  // A contagem por aba vem na 1ª página. Trocar de aba é outra queryKey (data
  // volta a undefined), então segurar a última conhecida evita o número piscar
  // a cada troca — some de vez só antes da 1ª resposta da sessão.
  const lastCounts = useRef<FeedCounts | undefined>(undefined)
  const counts = query.data?.pages[0]?.counts ?? lastCounts.current
  lastCounts.current = counts

  return { ...query, counts }
}
