import { useMutation } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'

export function useCreateInviteLink(eventId: string) {
  return useMutation({
    mutationFn: () => eventsService.createInviteLink(eventId),
  })
}
