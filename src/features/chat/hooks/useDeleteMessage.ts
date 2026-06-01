import { useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'
import type { MsgCache } from '../lib/realtimeCache'

function tombstone(cache: MsgCache, messageId: string): MsgCache {
  const now = new Date().toISOString()
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.map(m =>
        m.id === messageId
          ? { ...m, deletedAt: now, content: null, attachments: [] }
          : m,
      ),
    })),
  }
}

// Soft delete otimista: a bolha vira tombstone na hora; reverte em erro.
export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: (messageId: string) =>
      conversationsService.deleteMessage(conversationId, messageId),
    onMutate: async (messageId: string) => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<MsgCache>(key)
      queryClient.setQueryData<MsgCache>(key, old =>
        old ? tombstone(old, messageId) : old,
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
    },
  })
}
