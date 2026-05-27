import type { QueryClient } from '@tanstack/react-query'

export const userKeys = {
  all: ['users'] as const,
  me: ['users', 'me'] as const,
  profile: (id: string) => ['users', id] as const,
  events: (id: string) => ['users', id, 'events'] as const,
  search: (q: string) => ['users', 'search', q] as const,
}

export function invalidateUserViews(
  queryClient: QueryClient,
  userId?: string,
) {
  queryClient.invalidateQueries({ queryKey: userKeys.me })
  if (userId) {
    queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) })
    queryClient.invalidateQueries({ queryKey: userKeys.events(userId) })
  }
}
