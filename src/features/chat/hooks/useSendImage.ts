import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserMini } from '@/shared/types'
import { conversationsService } from '../services/conversationsService'
import {
  upsertOptimistic,
  reconcileSent,
  markFailed,
  applyMessageToInbox,
  type MsgCache,
} from '../lib/realtimeCache'
import { chatKeys } from './cacheKeys'
import type { ChatMessage } from '../types'

type SendImageVars = { uri: string; clientId: string }

// Upload otimista de imagem. A bolha aparece com a imagem local + spinner; no
// 201 vira o Message real (com a url do servidor); em erro vira 'failed'.
export function useSendImage(conversationId: string, me: UserMini) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: ({ uri }: SendImageVars) =>
      conversationsService.sendImage(conversationId, uri),
    onMutate: ({ uri, clientId }: SendImageVars) => {
      const optimistic: ChatMessage = {
        id: clientId,
        clientId,
        clientStatus: 'sending',
        conversationId,
        senderId: me.id,
        sender: me,
        content: null,
        attachments: [{ id: clientId, url: uri, format: '', size: 0, order: 0 }],
        createdAt: new Date().toISOString(),
        deletedAt: null,
      }
      queryClient.setQueryData<MsgCache>(key, prev =>
        upsertOptimistic(prev, optimistic),
      )
    },
    onSuccess: (real, { clientId }) => {
      queryClient.setQueryData<MsgCache>(key, prev =>
        reconcileSent(prev, clientId, real),
      )
      applyMessageToInbox(queryClient, real, me.id, true)
    },
    onError: (_err, { clientId }) => {
      queryClient.setQueryData<MsgCache>(key, prev => markFailed(prev, clientId))
    },
  })
}
