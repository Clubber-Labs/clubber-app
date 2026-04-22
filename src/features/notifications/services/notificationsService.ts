import { api } from '@/shared/lib/api'

export const notificationsService = {
  registerToken: (token: string) =>
    api.post('/notifications/token', { token }).then(r => r.data),
  list: () => api.get('/notifications').then(r => r.data),
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),
}
