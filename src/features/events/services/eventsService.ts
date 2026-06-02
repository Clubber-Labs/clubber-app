import { api } from '@/shared/lib/api'
import { buildImageFile } from '@/shared/utils/imageUpload'
import type {
  CursorPaginatedResponse,
  EventDetail,
  EventStatus,
  Attendance,
  AttendanceType,
  EventComment,
  EventPost,
  FeedAuthor,
  FeedEvent,
} from '@/shared/types'
import type { CreateEventPayload } from '../schemas/createEventSchema'

type ListParams = { limit?: number; cursor?: string }

type ListEventsParams = ListParams & {
  status?: EventStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
}

const buildParams = ({ limit = 20, cursor }: ListParams) => ({
  limit,
  ...(cursor ? { cursor } : {}),
})

export const eventsService = {
  list: (
    params: ListEventsParams = {},
  ): Promise<CursorPaginatedResponse<FeedEvent>> => {
    const { status, category, dateFrom, dateTo, ...pagination } = params
    return api
      .get('/events', {
        params: {
          ...buildParams(pagination),
          ...(status?.length ? { status } : {}),
          ...(category?.length ? { category } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        },
        // Backend espera array repetido (status=A&status=B), não brackets.
        paramsSerializer: { indexes: null },
      })
      .then(r => r.data)
  },

  search: (params: {
    q: string
    cursor?: string
    signal?: AbortSignal
  }): Promise<CursorPaginatedResponse<FeedEvent>> =>
    api
      .get('/events/search', {
        params: {
          q: params.q,
          limit: 20,
          ...(params.cursor ? { cursor: params.cursor } : {}),
        },
        signal: params.signal,
      })
      .then(r => r.data),

  getById: (id: string): Promise<EventDetail> =>
    api.get(`/events/${id}`).then(r => r.data),

  create: (data: CreateEventPayload): Promise<EventDetail> =>
    api.post('/events', data).then(r => r.data),

  update: (
    id: string,
    data: Partial<CreateEventPayload>,
  ): Promise<EventDetail> => api.put(`/events/${id}`, data).then(r => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/events/${id}`).then(() => undefined),

  getMyAttendance: (eventId: string): Promise<Attendance | null> =>
    api
      .get(`/events/${eventId}/attendances`)
      .then(r => r.data)
      .catch(() => null),

  setAttendance: (eventId: string, type: AttendanceType): Promise<Attendance> =>
    api.post(`/events/${eventId}/attendances`, { type }).then(r => r.data),

  cancelAttendance: (eventId: string): Promise<void> =>
    api.delete(`/events/${eventId}/attendances`).then(() => undefined),

  likeEvent: (eventId: string): Promise<void> =>
    api.post(`/events/${eventId}/reactions`).then(() => undefined),

  unlikeEvent: (eventId: string): Promise<void> =>
    api.delete(`/events/${eventId}/reactions`).then(() => undefined),

  likeComment: (commentId: string): Promise<void> =>
    api.post(`/comments/${commentId}/reactions`).then(() => undefined),

  unlikeComment: (commentId: string): Promise<void> =>
    api.delete(`/comments/${commentId}/reactions`).then(() => undefined),

  likePost: (postId: string): Promise<void> =>
    api.post(`/posts/${postId}/reactions`).then(() => undefined),

  unlikePost: (postId: string): Promise<void> =>
    api.delete(`/posts/${postId}/reactions`).then(() => undefined),

  listComments: (
    eventId: string,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<EventComment>> =>
    api
      .get(`/events/${eventId}/comments`, {
        params: buildParams({ limit: 10, ...params }),
      })
      .then(r => r.data),

  addComment: (eventId: string, content: string): Promise<EventComment> =>
    api.post(`/events/${eventId}/comments`, { content }).then(r => r.data),

  deleteComment: (eventId: string, commentId: string): Promise<void> =>
    api
      .delete(`/events/${eventId}/comments/${commentId}`)
      .then(() => undefined),

  listPosts: (
    eventId: string,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<EventPost>> =>
    api
      .get(`/events/${eventId}/posts`, { params: buildParams(params) })
      .then(r => r.data),

  addPost: (eventId: string, content: string): Promise<EventPost> =>
    api.post(`/events/${eventId}/posts`, { content }).then(r => r.data),

  deletePost: (eventId: string, postId: string): Promise<void> =>
    api.delete(`/events/${eventId}/posts/${postId}`).then(() => undefined),

  uploadEventImage: (eventId: string, uri: string): Promise<EventDetail> => {
    const form = new FormData()
    form.append('file', buildImageFile(uri, 'event.jpg'))
    return api
      .post(`/events/${eventId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },

  inviteUsers: (eventId: string, invitedIds?: string[]): Promise<void> =>
    api
      .post(
        `/events/${eventId}/invites`,
        invitedIds ? { invitedIds } : undefined,
      )
      .then(() => undefined),

  listInvites: (eventId: string): Promise<FeedAuthor[]> =>
    api.get(`/events/${eventId}/invites`).then(r => r.data),
}
