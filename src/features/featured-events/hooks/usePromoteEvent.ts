import { useMutation, useQueryClient } from '@tanstack/react-query'
import { featuredEventsService } from '../services/featuredEventsService'
import { featuredKeys } from './cacheKeys'
import type { CreateFeaturedEventInput, FeaturedEvent } from '../types'

export function usePromoteEvent(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateFeaturedEventInput) =>
      featuredEventsService.promote(eventId, input),
    onSuccess: (feature: FeaturedEvent) => {
      queryClient.setQueryData(featuredKeys.active(eventId), feature)
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}
