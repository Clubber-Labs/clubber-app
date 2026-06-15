import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { featuredKeys } from './cacheKeys'
import type { FeaturedEvent } from '../types'

type FeaturedEventResult =
  | { kind: 'active'; feature: FeaturedEvent }
  | { kind: 'scheduled'; feature: FeaturedEvent }
  | { kind: 'none' }

export function useFeaturedEvent(eventId: string): FeaturedEventResult {
  const queryClient = useQueryClient()

  // Subscribes reactively to cache set by usePromoteEvent.onSuccess and
  // cleared by useCancelPromotion.onSuccess. enabled:false means no network
  // fetch; the queryFn is never called.
  const { data: cachedFeature } = useQuery<FeaturedEvent | undefined>({
    queryKey: featuredKeys.active(eventId),
    queryFn: () => undefined,
    enabled: false,
    staleTime: Infinity,
  })

  // Purge expired cache entry so the form re-appears after the period ends.
  useEffect(() => {
    if (cachedFeature && new Date(cachedFeature.endsAt) < new Date()) {
      queryClient.setQueryData(featuredKeys.active(eventId), undefined)
    }
  }, [cachedFeature, eventId, queryClient])

  if (!cachedFeature || new Date(cachedFeature.endsAt) < new Date()) {
    return { kind: 'none' }
  }

  return new Date(cachedFeature.startsAt) <= new Date()
    ? { kind: 'active', feature: cachedFeature }
    : { kind: 'scheduled', feature: cachedFeature }
}
