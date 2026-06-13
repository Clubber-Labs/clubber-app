import { useMutation, useQueryClient } from '@tanstack/react-query'
import { featuredEventsService } from '../services/featuredEventsService'
import { featuredKeys } from './cacheKeys'

export function useCancelPromotion(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (featureId: string) =>
      featuredEventsService.cancel(eventId, featureId),
    onSuccess: () => {
      queryClient.setQueryData(featuredKeys.active(eventId), undefined)
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}
