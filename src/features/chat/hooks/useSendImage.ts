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
import type { ChatMessage, ReplyPreview } from '../types'

type SendImageVars = {
  uri: string
  clientId: string
  // Dimensões do asset local (do ImagePicker, ou do attachment no retry). A bolha
  // otimista já reserva o aspect-ratio real — sem isso ela cairia no 220×220 fixo
  // e "pularia" quando o 201 trouxesse width/height do servidor.
  width?: number
  height?: number
  replyTo?: ReplyPreview | null
}

// Upload otimista de imagem. A bolha aparece com a imagem local + spinner; no
// 201 vira o Message real (com a url do servidor); em erro vira 'failed'.
export function useSendImage(conversationId: string, me: UserMini) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: ({ uri, clientId, replyTo }: SendImageVars) =>
      conversationsService.sendImage(
        conversationId,
        uri,
        clientId,
        replyTo?.id,
      ),
    onMutate: ({ uri, clientId, width, height, replyTo }: SendImageVars) => {
      const optimistic: ChatMessage = {
        id: clientId,
        clientId,
        clientStatus: 'sending',
        conversationId,
        senderId: me.id,
        sender: me,
        content: null,
        attachments: [
          {
            id: clientId,
            url: uri,
            format: '',
            size: 0,
            order: 0,
            width,
            height,
          },
        ],
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
      queryClient.setQueryData<MsgCache>(key, prev =>
        markFailed(prev, clientId),
      )
    },
  })
}
