import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { InboxItem } from '../types'

type InboxCache = InfiniteData<CursorPaginatedResponse<InboxItem>>

// Optimistic remove da conversa no inbox — ver CLAUDE.md → "Tratamento de erros".
export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => conversationsService.remove(id),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: chatKeys.inbox })
      const prev = queryClient.getQueryData<InboxCache>(chatKeys.inbox)
      queryClient.setQueryData<InboxCache>(chatKeys.inbox, old =>
        removeFromInfiniteList(old, id),
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(chatKeys.inbox, ctx.prev)
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox }),
  })
}
