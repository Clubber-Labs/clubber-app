import type { QueryClient } from '@tanstack/react-query'

export const eventKeys = {
  all: ['events'] as const,
  detail: (id: string) => ['events', id] as const,
  list: ['events', 'list'] as const,
  comments: (id: string) => ['events', id, 'comments'] as const,
  posts: (id: string) => ['events', id, 'posts'] as const,
}

export const feedKey = ['feed'] as const

export function invalidateEventViews(
  queryClient: QueryClient,
  eventId?: string,
) {
  queryClient.invalidateQueries({ queryKey: feedKey })
  queryClient.invalidateQueries({ queryKey: eventKeys.list })
  queryClient.invalidateQueries({ queryKey: ['map-events'] })
  queryClient.invalidateQueries({ queryKey: ['heatmap'] })
  if (eventId) {
    queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
  }
}
