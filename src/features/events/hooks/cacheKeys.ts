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
  // Em mutations otimistas in-place (presença) o card já reflete a mudança;
  // refetch ativo do feed só reordenaria o item na hora. 'none' marca stale →
  // reordena no próximo refresh/fetch. Edição/upload usam 'active' (conteúdo
  // mudou e não está refletido no cache do feed).
  feedRefetch: 'active' | 'none' = 'active',
) {
  queryClient.invalidateQueries({ queryKey: feedKey, refetchType: feedRefetch })
  queryClient.invalidateQueries({ queryKey: eventKeys.list })
  queryClient.invalidateQueries({ queryKey: ['map-events'] })
  queryClient.invalidateQueries({ queryKey: ['heatmap'] })
  if (eventId) {
    queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
  }
}
