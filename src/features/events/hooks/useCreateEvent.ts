import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type {
  CreateEventInput,
  CreateEventPayload,
} from '../schemas/createEventSchema'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventInput) => {
      const payload: CreateEventPayload = {
        ...data,
        date: data.date.toISOString(),
        description: data.description?.trim() || undefined,
      }
      return eventsService.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
