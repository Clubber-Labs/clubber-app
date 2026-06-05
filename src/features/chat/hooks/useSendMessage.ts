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
import { uuidv4 } from '@/shared/utils/uuid'
import type { ChatMessage, ReplyPreview } from '../types'

// UUID v4: reusado como `Idempotency-Key` em todo envio (o contrato exige a chave
// em todos os tipos). É 1-por-mensagem e o retry reusa o mesmo clientId, então o
// backend deduplica o reenvio. O reconcile casa por igualdade exata — o formato
// não importa, só a unicidade.
export function newClientId(): string {
  return uuidv4()
}

type SendVars = {
  content: string
  clientId: string
  replyTo?: ReplyPreview | null
}

// Envio otimista de texto. A bolha aparece na hora (clientStatus 'sending'); no
// 201 vira o Message real; em erro vira 'failed' (retry reusa o mesmo clientId).
export function useSendMessage(conversationId: string, me: UserMini) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: ({ content, clientId, replyTo }: SendVars) =>
      conversationsService.sendMessage(
        conversationId,
        content,
        clientId,
        replyTo?.id,
      ),
    onMutate: ({ content, clientId, replyTo }: SendVars) => {
      const optimistic: ChatMessage = {
        id: clientId,
        clientId,
        clientStatus: 'sending',
        conversationId,
        senderId: me.id,
        sender: me,
        content,
        attachments: [],
        createdAt: new Date().toISOString(),
        deletedAt: null,
        replyTo: replyTo ?? null,
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
