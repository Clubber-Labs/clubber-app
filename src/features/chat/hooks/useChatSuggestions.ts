import { useMemo } from 'react'
import {
  useFollowers,
  useFollowing,
} from '@/features/follows/hooks/useFollowList'
import type { FollowListUser } from '@/features/follows/services/followsService'
import type { PickablePerson } from '../types'

// Recomendações para iniciar conversa: quem o usuário segue + seguidores,
// deduplicados e sem o próprio usuário. Primeira página de cada lista basta.
//
// A relação de follow vem PRONTA do backend (nos dois sentidos), não derivada da
// lista de origem: com só a primeira página carregada, "está na minha lista de
// following" não é resposta confiável para quem entrou pela lista de seguidores.
export function useChatSuggestions(myId: string) {
  const following = useFollowing(myId)
  const followers = useFollowers(myId)

  const people = useMemo<PickablePerson[]>(() => {
    const seen = new Set<string>()
    const merged: PickablePerson[] = []

    const collect = (pages: { data: FollowListUser[] }[] | undefined) => {
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
