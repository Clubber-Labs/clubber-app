import { api } from '@/shared/lib/api'
import type { CreateFeaturedEventInput, FeaturedEvent } from '../types'

export const featuredEventsService = {
  promote: (
    eventId: string,
    input: CreateFeaturedEventInput,
  ): Promise<FeaturedEvent> =>
    api
      .post(`/events/${eventId}/featured`, input)
      .then(r => r.data as FeaturedEvent),

  cancel: (eventId: string, featureId: string): Promise<void> =>
    api
      .delete(`/events/${eventId}/featured/${featureId}`)
      .then(() => undefined),
}
