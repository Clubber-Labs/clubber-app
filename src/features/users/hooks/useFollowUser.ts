// Padrão otimista canônico — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { followsService } from '@/features/follows/services/followsService'
import type {
  CursorPaginatedResponse,
  FollowStatus,
  UserProfile,
} from '@/shared/types'
import type { SearchUserItem } from '../schemas/searchUserSchema'
import { userKeys } from './cacheKeys'

type SearchCache = InfiniteData<CursorPaginatedResponse<SearchUserItem>>
type SearchSnapshot = ReadonlyArray<
  [readonly unknown[], SearchCache | undefined]
>

type Snapshot = {
  profile: UserProfile | undefined
  searches: SearchSnapshot
}

const SEARCH_PREFIX = ['users', 'search'] as const

export function useFollowUser(userId: string) {
  const queryClient = useQueryClient()
  const queryKey = userKeys.profile(userId)

  function applyStatus(status: FollowStatus, deltaFollowers: number) {
    queryClient.setQueryData<UserProfile>(queryKey, prev => {
      if (!prev) return prev
      return {
        ...prev,
        followStatus: status,
        followersCount: Math.max(0, prev.followersCount + deltaFollowers),
      }
    })
    // O card de busca lê followStatus do cache ['users','search',q] — sem patch
    // aqui o botão "volta" pra Seguir após isPending. Percorre todas as queries
    // de busca ativas e atualiza apenas o item com id igual.
    const searches = queryClient.getQueriesData<SearchCache>({
      queryKey: SEARCH_PREFIX,
    })
    for (const [key, data] of searches) {
      if (!data) continue
      queryClient.setQueryData<SearchCache>(key, old => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(item =>
              item.id === userId ? { ...item, followStatus: status } : item,
            ),
          })),
        }
      })
    }
  }

  function snapshot(): Snapshot {
    return {
      profile: queryClient.getQueryData<UserProfile>(queryKey),
      searches: queryClient.getQueriesData<SearchCache>({
        queryKey: SEARCH_PREFIX,
      }),
    }
  }

  function restore({ profile, searches }: Snapshot) {
    queryClient.setQueryData(queryKey, profile)
    for (const [key, data] of searches) {
      queryClient.setQueryData(key, data)
    }
  }

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey: SEARCH_PREFIX })
  }

  const follow = useMutation({
    mutationFn: () => followsService.follow(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      await queryClient.cancelQueries({ queryKey: SEARCH_PREFIX })
      const prev = snapshot()
      const isPrivate = prev.profile?.isPrivate ?? false
      applyStatus(isPrivate ? 'PENDING' : 'ACCEPTED', isPrivate ? 0 : 1)
      return prev
    },
    onError: (_err, _vars, ctx) => ctx && restore(ctx),
    onSettled: invalidateAll,
  })

  const unfollow = useMutation({
    mutationFn: () => followsService.unfollow(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      await queryClient.cancelQueries({ queryKey: SEARCH_PREFIX })
      const prev = snapshot()
      const wasAccepted = prev.profile?.followStatus === 'ACCEPTED'
      applyStatus(null, wasAccepted ? -1 : 0)
      return prev
    },
    onError: (_err, _vars, ctx) => ctx && restore(ctx),
    onSettled: invalidateAll,
  })

  return { follow, unfollow }
}
