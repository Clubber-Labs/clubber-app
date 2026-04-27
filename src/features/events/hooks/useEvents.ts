import { useQuery } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
  })
}
