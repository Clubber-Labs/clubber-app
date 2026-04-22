import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type { CreateEventInput } from '../schemas/createEventSchema'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: eventsService.list,
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventInput) => eventsService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}
