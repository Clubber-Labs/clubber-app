import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserMini } from '@/shared/types'
import { conversationsService } from '../services/conversationsService'
import { uploadVideoToCloudinary } from '../lib/cloudinaryUpload'
import {
  upsertOptimistic,
  reconcileSent,
  markFailed,
  setOptimisticPublicId,
  applyMessageToInbox,
  type MsgCache,
} from '../lib/realtimeCache'
import { chatKeys } from './cacheKeys'
import type { ChatMessage } from '../types'

type SendVideoVars = {
  uri: string
  clientId: string
  width?: number
  height?: number
  durationMs?: number
  // Retry: o upload ao Cloudinary já completou numa tentativa anterior — pula o
  // re-upload e vai direto criar a mensagem com este publicId.
  publicId?: string
}

// Upload otimista de vídeo em 3 passos (assinatura → upload direto ao Cloudinary
// → criar mensagem). A bolha aparece com a uri local + spinner (sem thumbnail);
// no 201 vira o Message real (poster + duração); em erro vira 'failed'. O retry
// reusa o publicId stashado na bolha (não re-sobe) e o mesmo clientId
// (Idempotency-Key → não duplica). Vídeo não carrega replyTo (igual ao áudio).
export function useSendVideo(conversationId: string, me: UserMini) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: async ({ uri, clientId, publicId }: SendVideoVars) => {
      let pid = publicId
      if (!pid) {
        const signed = await conversationsService.videoSignature(conversationId)
        const uploaded = await uploadVideoToCloudinary(signed, uri)
        pid = uploaded.publicId
        // Stash no cache antes de criar a mensagem: se o passo seguinte falhar, o
        // retry acha o publicId na bolha e pula o re-upload.
        queryClient.setQueryData<MsgCache>(key, prev =>
          setOptimisticPublicId(prev, clientId, uploaded.publicId),
        )
      }
      return conversationsService.sendVideoMessage(
        conversationId,
        pid,
        clientId,
      )
    },
    onMutate: ({
      uri,
      clientId,
      width,
      height,
      durationMs,
      publicId,
    }: SendVideoVars) => {
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
            kind: 'VIDEO',
            url: uri,
            format: '',
            size: 0,
            order: 0,
            width,
            height,
            durationMs,
            // Sem thumbnailUrl → o VideoMessage mostra caixa + spinner. Preserva
            // publicId no retry pra não re-subir.
            ...(publicId ? { publicId } : {}),
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
