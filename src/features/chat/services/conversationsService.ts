import { api } from '@/shared/lib/api'
import { buildImageFile } from '@/shared/utils/imageUpload'
import { buildAudioFile } from '@/shared/utils/audioUpload'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { SignedUpload } from '../lib/cloudinaryUpload'
import type { Conversation, InboxItem, Message, Role } from '../types'

export type SendAudioInput = {
  uri: string
  durationMs: number
  waveform?: number[]
}

type ListParams = { limit?: number; cursor?: string }

type CreateDirect = { type: 'DIRECT'; targetUserId: string }
type CreateGroup = { type: 'GROUP'; title: string; participantIds: string[] }
export type CreateConversationInput = CreateDirect | CreateGroup

const buildParams = ({ limit = 20, cursor }: ListParams) => ({
  limit,
  ...(cursor ? { cursor } : {}),
})

export const conversationsService = {
  list: (
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<InboxItem>> =>
    api
      .get('/conversations', { params: buildParams(params) })
      .then(r => r.data),

  getById: (id: string): Promise<Conversation> =>
    api.get(`/conversations/${id}`).then(r => r.data),

  create: (data: CreateConversationInput): Promise<Conversation> =>
    api.post('/conversations', data).then(r => r.data),

  rename: (id: string, title: string): Promise<Conversation> =>
    api.patch(`/conversations/${id}`, { title }).then(r => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/conversations/${id}`).then(() => undefined),

  listMessages: (
    id: string,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<Message>> =>
    api
      .get(`/conversations/${id}/messages`, { params: buildParams(params) })
      .then(r => r.data),

  // `idempotencyKey` (= clientId) vai no header em TODO envio: o backend exige a
  // chave e a usa pra deduplicar reenvios (mesmo clientId no retry → não duplica).
  sendMessage: (
    id: string,
    content: string,
    idempotencyKey: string,
    replyToId?: string,
  ): Promise<Message> =>
    api
      .post(
        `/conversations/${id}/messages`,
        {
          content,
          ...(replyToId ? { replyToId } : {}),
        },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      .then(r => r.data),

  editMessage: (
    id: string,
    messageId: string,
    content: string,
  ): Promise<Message> =>
    api
      .patch(`/conversations/${id}/messages/${messageId}`, { content })
      .then(r => r.data),

  sendImage: (
    id: string,
    uri: string,
    idempotencyKey: string,
    replyToId?: string,
  ): Promise<Message> => {
    const form = new FormData()
    form.append('file', buildImageFile(uri, 'message.jpg'))
    if (replyToId) form.append('replyToId', replyToId)
    return api
      .post(`/conversations/${id}/messages/images`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Idempotency-Key': idempotencyKey,
        },
      })
      .then(r => r.data)
  },

  // Nota de voz (m4a/AAC). Ordem do multipart importa: os campos de texto
  // (durationMs, waveform) precisam vir ANTES do arquivo, porque o backend lê os
  // fields no momento em que o `audio` chega. Por isso o `audio` é o último part.
  // Content-Type setado igual ao sendImage: no RN + axios deste app o boundary é
  // (re)gerado pela camada nativa a partir do FormData mesmo com o header presente;
  // OMITIR fazia o axios mandar como application/json e o backend não parseava.
  sendAudio: (
    id: string,
    input: SendAudioInput,
    idempotencyKey: string,
  ): Promise<Message> => {
    const form = new FormData()
    form.append('durationMs', String(Math.round(input.durationMs)))
    if (input.waveform && input.waveform.length > 0) {
      form.append('waveform', JSON.stringify(input.waveform))
    }
    form.append('audio', buildAudioFile(input.uri))
    return api
      .post(`/conversations/${id}/messages/audio`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Idempotency-Key': idempotencyKey,
        },
      })
      .then(r => r.data)
  },

  // Fluxo de vídeo em 2 chamadas REST (o upload do arquivo vai direto ao
  // Cloudinary, ver lib/cloudinaryUpload). 1) assina o upload; sem body —
  // o backend deriva folder/limites do contexto da conversa.
  videoSignature: (id: string): Promise<SignedUpload> =>
    api.post(`/conversations/${id}/messages/video/signature`).then(r => r.data),

  // 2) cria a mensagem a partir do `publicId` já enviado ao Cloudinary. Vídeo
  // não carrega replyTo (igual ao áudio). Idempotency-Key dedup o reenvio.
  sendVideoMessage: (
    id: string,
    publicId: string,
    idempotencyKey: string,
  ): Promise<Message> =>
    api
      .post(
        `/conversations/${id}/messages/video`,
        { publicId },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      .then(r => r.data),

  markRead: (id: string): Promise<void> =>
    api.post(`/conversations/${id}/read`).then(() => undefined),

  // Confirma ENTREGA (recebi no aparelho, sem necessariamente abrir). Chamado ao
  // receber uma mensagem de outro pelo WS. Degrada: se o endpoint ainda não
  // existir no backend, o caller ignora o erro.
  markDelivered: (id: string): Promise<void> =>
    api.post(`/conversations/${id}/delivered`).then(() => undefined),

  deleteMessage: (id: string, messageId: string): Promise<void> =>
    api
      .delete(`/conversations/${id}/messages/${messageId}`)
      .then(() => undefined),

  leave: (id: string): Promise<void> =>
    api.post(`/conversations/${id}/leave`).then(() => undefined),

  addParticipant: (id: string, userId: string): Promise<Conversation> =>
    api.post(`/conversations/${id}/participants`, { userId }).then(r => r.data),

  removeParticipant: (id: string, userId: string): Promise<void> =>
    api
      .delete(`/conversations/${id}/participants/${userId}`)
      .then(() => undefined),

  updateRole: (id: string, userId: string, role: Role): Promise<Conversation> =>
    api
      .patch(`/conversations/${id}/participants/${userId}`, { role })
      .then(r => r.data),
}
