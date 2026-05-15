import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'

const invitesKey = (eventId: string) => ['events', eventId, 'invites']

export function useEventInvites(eventId: string) {
  return useQuery({
    queryKey: invitesKey(eventId),
    queryFn: () => eventsService.listInvites(eventId),
    enabled: !!eventId,
  })
}

export function useInviteUsers(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invitedIds?: string[]) =>
      eventsService.inviteUsers(eventId, invitedIds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: invitesKey(eventId) }),
  })
}
