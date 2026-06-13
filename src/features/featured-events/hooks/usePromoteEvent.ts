import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateEventViews } from '@/features/events/hooks/cacheKeys'
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
      // isFeatured muda em todas as views — feed, mapa, lista e detalhe.
      invalidateEventViews(queryClient, eventId)
    },
  })
}
