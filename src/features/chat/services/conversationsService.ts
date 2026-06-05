import { api } from '@/shared/lib/api'
import { buildImageFile } from '@/shared/utils/imageUpload'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { Conversation, InboxItem, Message, Role } from '../types'

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
    api.get('/conversations', { params: buildParams(params) }).then(r => r.data),

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

  sendMessage: (
    id: string,
    content: string,
    replyToId?: string,
  ): Promise<Message> =>
    api
      .post(`/conversations/${id}/messages`, {
        content,
        ...(replyToId ? { replyToId } : {}),
      })
      .then(r => r.data),

  editMessage: (
    id: string,
    messageId: string,
    content: string,
  ): Promise<Message> =>
    api
      .patch(`/conversations/${id}/messages/${messageId}`, { content })
      .then(r => r.data),

  sendImage: (id: string, uri: string, replyToId?: string): Promise<Message> => {
    const form = new FormData()
    form.append('file', buildImageFile(uri, 'message.jpg'))
    if (replyToId) form.append('replyToId', replyToId)
    return api
      .post(`/conversations/${id}/messages/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },

  markRead: (id: string): Promise<void> =>
    api.post(`/conversations/${id}/read`).then(() => undefined),

  deleteMessage: (id: string, messageId: string): Promise<void> =>
    api
      .delete(`/conversations/${id}/messages/${messageId}`)
      .then(() => undefined),

  leave: (id: string): Promise<void> =>
    api.post(`/conversations/${id}/leave`).then(() => undefined),

  addParticipant: (id: string, userId: string): Promise<Conversation> =>
    api
      .post(`/conversations/${id}/participants`, { userId })
      .then(r => r.data),

  removeParticipant: (id: string, userId: string): Promise<void> =>
    api
      .delete(`/conversations/${id}/participants/${userId}`)
      .then(() => undefined),

  updateRole: (id: string, userId: string, role: Role): Promise<Conversation> =>
    api
      .patch(`/conversations/${id}/participants/${userId}`, { role })
      .then(r => r.data),
}
