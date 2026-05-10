import { useQuery } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type { EventStatus } from '@/shared/types'

type ListFilters = {
  status?: EventStatus[]
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
  })
}

export function useEventsList(limit = 50, filters: ListFilters = {}) {
  return useQuery({
    queryKey: ['events', 'list', limit, filters],
    queryFn: () => eventsService.list({ limit, ...filters }),
    staleTime: 1000 * 60,
  })
}
