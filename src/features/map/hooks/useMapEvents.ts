import { useMemo } from 'react'
import { useEventsList } from '@/features/events/hooks/useEvents'
import type { FeedEvent } from '@/shared/types'
import { ALL_CATEGORIES } from '../constants'

export function useMapEvents(activeCategory: string) {
  const { data, isLoading, error } = useEventsList(50)

  const events = useMemo(
    () =>
      (data?.data ?? []).filter(
        e => typeof e.latitude === 'number' && typeof e.longitude === 'number',
      ),
    [data],
  )

  const categories = useMemo(() => {
    const set = new Set<string>()
    events.forEach(e => e.category && set.add(e.category))
    return [ALL_CATEGORIES, ...Array.from(set)]
  }, [events])

  const filteredEvents = useMemo(
    () =>
      activeCategory === ALL_CATEGORIES
        ? events
        : events.filter(e => e.category === activeCategory),
    [events, activeCategory],
  )

  const eventsGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filteredEvents.map((event: FeedEvent) => ({
        type: 'Feature' as const,
        id: event.id,
        properties: { eventId: event.id, title: event.title },
        geometry: {
          type: 'Point' as const,
          coordinates: [event.longitude, event.latitude],
        },
      })),
    }),
    [filteredEvents],
  )

  return { categories, filteredEvents, eventsGeoJson, isLoading, error }
}
