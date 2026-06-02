import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { eventsService } from '@/features/events/services/eventsService'
import type { FeedEvent } from '@/shared/types'

// Busca global de eventos (backend). Debounce evita flood/429; só a 1ª página
// basta para o dropdown. O `signal` cancela requests em voo ao digitar.
export function useSearchEvents(query: string) {
  const trimmed = useDebounce(query, 350).trim()

  const result = useQuery({
    queryKey: ['events', 'search', trimmed],
    queryFn: ({ signal }) => eventsService.search({ q: trimmed, signal }),
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 30,
  })

  const events = useMemo<FeedEvent[]>(
    () => result.data?.data ?? [],
    [result.data],
  )

  return {
    events,
    trimmed,
    isLoading: result.isLoading,
    isError: result.isError,
  }
}
