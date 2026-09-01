import { api } from '@/shared/lib/api'
import { buildImageFile } from '@/shared/utils/imageUpload'
import type {
  CursorPaginatedResponse,
  EventDetail,
  EventImage,
  EventStatus,
  Attendance,
  AttendanceType,
  EventComment,
  EventPost,
  FeedAuthor,
  FeedEvent,
  InviteLink,
} from '@/shared/types'
import type {
  CreateEventPayload,
  UpdateEventPayload,
} from '../schemas/createEventSchema'

type ListParams = { limit?: number; cursor?: string }

type ListEventsParams = ListParams & {
  status?: EventStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
}

// Comentário vive em evento ou em post, e as duas famílias de rota são
// espelhadas — o alvo é o que muda o prefixo.
export type CommentTarget =
  | { kind: 'event'; eventId: string }
  | { kind: 'post'; postId: string }

const commentsPath = (target: CommentTarget) =>
  target.kind === 'event'
    ? `/events/${target.eventId}/comments`
    : `/posts/${target.postId}/comments`

export type InviteTarget =
  | { kind: 'selected'; userIds: string[] }
  | { kind: 'all' }

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

  update: (id: string, data: UpdateEventPayload): Promise<EventDetail> =>
    api.put(`/events/${id}`, data).then(r => r.data),

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

  // "Cheguei" do evento ao vivo. Idempotente no backend: repetir não duplica.
  checkIn: (eventId: string): Promise<void> =>
    api.post(`/events/${eventId}/check-ins`).then(() => undefined),

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

  // Só as raízes da thread: as respostas saem por listReplies, senão
  // apareceriam soltas na lista, fora do comentário que responderam.
  listComments: (
    target: CommentTarget,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<EventComment>> =>
    api
      .get(commentsPath(target), {
        params: buildParams({ limit: 10, ...params }),
      })
      .then(r => r.data),

  addComment: (target: CommentTarget, content: string): Promise<EventComment> =>
    api.post(commentsPath(target), { content }).then(r => r.data),

  // A notificação de resposta chega com o id da RESPOSTA — é o `parentId` do
  // que volta daqui que diz qual thread abrir.
  getComment: (
    target: CommentTarget,
    commentId: string,
  ): Promise<EventComment> =>
    api.get(`${commentsPath(target)}/${commentId}`).then(r => r.data),

  // Cronológica (o backend ordena por createdAt asc), ao contrário da listagem
  // de raízes que a UI exibe do mais novo pro mais velho.
  listReplies: (
    target: CommentTarget,
    parentId: string,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<EventComment>> =>
    api
      .get(`${commentsPath(target)}/${parentId}/replies`, {
        params: buildParams({ limit: 10, ...params }),
      })
      .then(r => r.data),

  addReply: (
    target: CommentTarget,
    parentId: string,
    content: string,
  ): Promise<EventComment> =>
    api.post(commentsPath(target), { content, parentId }).then(r => r.data),

  deleteComment: (target: CommentTarget, commentId: string): Promise<void> =>
    api.delete(`${commentsPath(target)}/${commentId}`).then(() => undefined),

  listPosts: (
    eventId: string,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<EventPost>> =>
    api
      .get(`/events/${eventId}/posts`, { params: buildParams(params) })
      .then(r => r.data),

  // Só a listagem monta `userLiked`; a resposta do POST não o traz. O post
  // criado não entra no cache (useAddPost invalida a lista), então o campo
  // ausente não chega a nenhuma tela — mas o tipo não pode prometê-lo.
  addPost: (
    eventId: string,
    content: string,
  ): Promise<Omit<EventPost, 'userLiked'>> =>
    api.post(`/events/${eventId}/posts`, { content }).then(r => r.data),

  deletePost: (eventId: string, postId: string): Promise<void> =>
    api.delete(`/events/${eventId}/posts/${postId}`).then(() => undefined),

  // Uma imagem por request; entra no fim da galeria (order = max + 1).
  uploadEventImage: (eventId: string, uri: string): Promise<EventImage> => {
    const form = new FormData()
    form.append('file', buildImageFile(uri, 'event.jpg'))
    return api
      .post(`/events/${eventId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },

  deleteEventImage: (eventId: string, imageId: string): Promise<void> =>
    api.delete(`/events/${eventId}/images/${imageId}`).then(() => undefined),

  // `order` tem que ser rearranjo EXATO da galeria atual — id faltando, repetido
  // ou de outro evento volta 400 IMAGE_ORDER_MISMATCH. Devolve a galeria já
  // reordenada, e images[0] é a nova capa.
  reorderEventImages: (
    eventId: string,
    order: string[],
  ): Promise<EventImage[]> =>
    api.patch(`/events/${eventId}/images`, { order }).then(r => r.data),

  uploadPostImage: (
    eventId: string,
    postId: string,
    uri: string,
  ): Promise<EventImage> => {
    const form = new FormData()
    form.append('file', buildImageFile(uri, 'post.jpg'))
    return api
      .post(`/events/${eventId}/posts/${postId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },

  // Idempotente no backend: reusa o link vigente se já houver um (200) ou cria
  // um novo (201). Author-only — 403 NOT_EVENT_AUTHOR para os demais.
  createInviteLink: (eventId: string): Promise<InviteLink> =>
    api.post(`/events/${eventId}/invite-links`).then(r => r.data),

  // Corpo strict — campo extra dá 400. Omitir a lista significa "convida todos
  // os seguidores": o alvo é explícito pra `undefined` não virar fan-out.
  inviteUsers: (eventId: string, target: InviteTarget): Promise<void> =>
    api
      .post(
        `/events/${eventId}/invites`,
        target.kind === 'all' ? { all: true } : { userIds: target.userIds },
      )
      .then(() => undefined),

  // A API devolve os registros de convite com o usuário aninhado em `invited`
  // (o registro traz também inviterId etc., que o app não consome) — o
  // achatamento pro shape de pessoa acontece aqui, na fronteira.
  listInvites: (eventId: string): Promise<FeedAuthor[]> =>
    api
      .get<{ invited: FeedAuthor }[]>(`/events/${eventId}/invites`)
      .then(r => r.data.map(invite => invite.invited)),
}
