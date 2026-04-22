import { api } from '@/shared/lib/api'

export const followsService = {
  follow: (userId: string) =>
    api.post(`/users/${userId}/follow`).then(r => r.data),
  unfollow: (userId: string) =>
    api.delete(`/users/${userId}/follow`).then(r => r.data),
  followers: (userId: string) =>
    api.get(`/users/${userId}/followers`).then(r => r.data),
  following: (userId: string) =>
    api.get(`/users/${userId}/following`).then(r => r.data),
}
