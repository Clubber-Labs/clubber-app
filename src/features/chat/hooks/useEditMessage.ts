import { useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'
import type { InboxCache, MsgCache } from '../lib/realtimeCache'

function applyEdit(
  cache: MsgCache,
  messageId: string,
  content: string,
  editedAt: string,
): MsgCache {
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.map(m =>
        m.id === messageId ? { ...m, content, editedAt } : m,
      ),
    })),
  }
}

// Espelha a edição no preview do inbox quando a mensagem editada é a última —
// paridade com o applyMessageUpdate do realtime, pra não esperar o refetch.
function applyEditToInbox(
  cache: InboxCache,
  conversationId: string,
  messageId: string,
  content: string,
  editedAt: string,
): InboxCache {
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.map(c =>
        c.id === conversationId && c.lastMessage?.id === messageId
          ? { ...c, lastMessage: { ...c.lastMessage, content, editedAt } }
          : c,
      ),
    })),
  }
}

// Edição otimista: conteúdo + "editada" mudam na hora (mensagem e, se for a
// última, o preview do inbox); reverte em erro.
export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string
      content: string
    }) => conversationsService.editMessage(conversationId, messageId, content),
    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({ queryKey: key })
      await queryClient.cancelQueries({ queryKey: chatKeys.inbox })
      const prevMessages = queryClient.getQueryData<MsgCache>(key)
      const prevInbox = queryClient.getQueryData<InboxCache>(chatKeys.inbox)
      const editedAt = new Date().toISOString()
      queryClient.setQueryData<MsgCache>(key, old =>
        old ? applyEdit(old, messageId, content, editedAt) : old,
      )
      queryClient.setQueryData<InboxCache>(chatKeys.inbox, old =>
        old
          ? applyEditToInbox(old, conversationId, messageId, content, editedAt)
          : old,
      )
      return { prevMessages, prevInbox }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevMessages) queryClient.setQueryData(key, ctx.prevMessages)
      if (ctx?.prevInbox)
        queryClient.setQueryData(chatKeys.inbox, ctx.prevInbox)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
    },
  })
}
