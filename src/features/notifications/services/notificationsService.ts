import { api } from '@/shared/lib/api'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { AppNotification } from '../schemas/notificationSchema'

type ListParams = {
  cursor?: string
  limit?: number
}

export const notificationsService = {
  list: (
    params: ListParams = {},
  ): Promise<CursorPaginatedResponse<AppNotification>> =>
    api.get('/notifications', { params }).then(r => r.data),

  unreadCount: (): Promise<{ count: number }> =>
    api.get('/notifications/unread-count').then(r => r.data),

  markRead: (id: string): Promise<void> =>
    api.patch(`/notifications/${id}/read`).then(() => undefined),

  markAllRead: (): Promise<{ updated: number }> =>
    api.post('/notifications/read-all').then(r => r.data),

  registerDevice: (token: string, platform: 'ios' | 'android'): Promise<void> =>
    api.post('/devices', { token, platform }).then(() => undefined),

  // Idempotente no backend (204 mesmo se o token já não existe).
  // skipAuthHandler: roda dentro do endSession com sessão expirada — um 401
  // aqui re-dispararia o handler global e entraria em loop de logout.
  removeDevice: (token: string): Promise<void> =>
    api
      .delete(`/devices/${encodeURIComponent(token)}`, {
        skipAuthHandler: true,
      })
      .then(() => undefined),

  // Geohash precisão 6 calculado NO DEVICE — a coordenada precisa nunca sai
  // do aparelho (minimização de dados / LGPD).
  updateLocation: (geohash: string): Promise<void> =>
    api.patch('/users/me/location', { geohash }).then(() => undefined),

  updateNotificationPrefs: (
    notifyRadiusKm: number,
  ): Promise<{ id: string; notifyRadiusKm: number }> =>
    api
      .patch('/users/me/notification-prefs', { notifyRadiusKm })
      .then(r => r.data),
}
