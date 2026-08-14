import type { QueryClient } from '@tanstack/react-query'

export const userKeys = {
  all: ['users'] as const,
  me: ['users', 'me'] as const,
  profile: (id: string) => ['users', id] as const,
  events: (id: string) => ['users', id, 'events'] as const,
  search: (q: string) => ['users', 'search', q] as const,
  // Username na chave: cada valor tem a própria entrada, então resposta de um
  // valor antigo não pinta o estado do valor atual.
  usernameAvailability: (username: string) =>
    ['users', 'username-available', username] as const,
}

export function invalidateUserViews(queryClient: QueryClient, userId?: string) {
  queryClient.invalidateQueries({ queryKey: userKeys.me })
  if (userId) {
    queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) })
    queryClient.invalidateQueries({ queryKey: userKeys.events(userId) })
  }
}
