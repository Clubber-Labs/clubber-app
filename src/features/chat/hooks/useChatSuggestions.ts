import { useMemo } from 'react'
import { useFollowers, useFollowing } from '@/features/follows/hooks/useFollowList'
import type { FeedAuthor, UserMini } from '@/shared/types'

// Recomendações para iniciar conversa: quem o usuário segue + seguidores,
// deduplicados e sem o próprio usuário. Primeira página de cada lista basta.
export function useChatSuggestions(myId: string) {
  const following = useFollowing(myId)
  const followers = useFollowers(myId)

  const people = useMemo<UserMini[]>(() => {
    const seen = new Set<string>()
    const merged: UserMini[] = []

    const collect = (pages?: { data: FeedAuthor[] }[]) => {
      pages?.forEach(page =>
        page.data.forEach(user => {
          if (user.id === myId || seen.has(user.id)) return
          seen.add(user.id)
          merged.push(user)
        }),
      )
    }

    collect(following.data?.pages)
    collect(followers.data?.pages)
    return merged
  }, [following.data, followers.data, myId])

  return {
    people,
    isLoading: following.isLoading || followers.isLoading,
  }
}
