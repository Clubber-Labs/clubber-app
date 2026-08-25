import { api } from '@/shared/lib/api'
import type {
  CursorPaginatedResponse,
  FeedAuthor,
  FollowStatus,
} from '@/shared/types'

// Além do FeedAuthor, as listas trazem a privacidade e a relação do REQUISITANTE
// com cada pessoa nos dois sentidos — é o que permite ao chat saber se dá pra
// abrir conversa sem tentar o POST (privado exige mútuo). Opcionais pra degradar
// contra backend anterior aos campos.
export type FollowListUser = FeedAuthor & {
  isPrivate?: boolean
  followStatus?: FollowStatus
  followsYou?: boolean
}

type ListParams = { limit?: number; cursor?: string }

const buildParams = ({ limit = 20, cursor }: ListParams) => ({
  limit,
  ...(cursor ? { cursor } : {}),
})

export const followsService = {
  follow: (userId: string) =>
    api.post(`/users/${userId}/follow`).then(r => r.data),

  unfollow: (userId: string) =>
    api.delete(`/users/${userId}/follow`).then(r => r.data),

  removeFollower: (followerId: string): Promise<void> =>
    api.delete(`/users/me/followers/${followerId}`).then(() => undefined),

  followers: (
    userId: string,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<FollowListUser>> =>
    api
      .get(`/users/${userId}/followers`, { params: buildParams(params) })
      .then(r => r.data),

  following: (
    userId: string,
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<FollowListUser>> =>
    api
      .get(`/users/${userId}/following`, { params: buildParams(params) })
      .then(r => r.data),

  listFollowRequests: (
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<FeedAuthor>> =>
    api
      .get('/users/me/follow-requests', { params: buildParams(params) })
      .then(r => r.data),

  acceptFollowRequest: (followerId: string): Promise<void> =>
    api
      .post(`/users/me/follow-requests/${followerId}/accept`)
      .then(() => undefined),

  rejectFollowRequest: (followerId: string): Promise<void> =>
    api.delete(`/users/me/follow-requests/${followerId}`).then(() => undefined),
}
