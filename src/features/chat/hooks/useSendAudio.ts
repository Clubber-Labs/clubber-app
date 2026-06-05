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

type SendAudioVars = {
  uri: string
  durationMs: number
  waveform: number[]
  clientId: string
}

// Upload otimista de nota de voz, espelhando useSendImage: a bolha aparece com a
// uri local (tocável na hora) + status 'sending'; no 201 vira o Message real (url
// do servidor); em erro vira 'failed' (revert é o feedback). O áudio não carrega
// replyTo — o contrato do endpoint não tem esse campo.
export function useSendAudio(conversationId: string, me: UserMini) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: ({ uri, durationMs, waveform }: SendAudioVars) =>
      conversationsService.sendAudio(conversationId, {
        uri,
        durationMs,
        waveform,
      }),
    onMutate: ({ uri, durationMs, waveform, clientId }: SendAudioVars) => {
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
            kind: 'AUDIO',
            url: uri,
            format: 'm4a',
            size: 0,
            order: 0,
            durationMs,
            waveform,
          },
        ],
        createdAt: new Date().toISOString(),
        deletedAt: null,
        replyTo: null,
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
