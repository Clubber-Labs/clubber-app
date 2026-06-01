import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'
import type { ChatMessage } from '../types'

// Histórico em ordem decrescente (mais recente primeiro), como o FlatList
// invertido espera. `fetchNextPage` carrega as mais antigas (topo da tela).
export function useMessages(id: string) {
  const query = useInfiniteQuery({
    queryKey: chatKeys.messages(id),
    queryFn: ({ pageParam }) =>
      conversationsService.listMessages(id, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? null,
    enabled: !!id,
  })

  const messages = useMemo(
    () => flattenInfiniteList<ChatMessage>(query.data),
    [query.data],
  )

  return { ...query, messages }
}
