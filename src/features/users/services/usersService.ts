import { api } from '@/shared/lib/api'
import type {
  CursorPaginatedResponse,
  UserProfile,
  UserEventSummary,
} from '@/shared/types'

type ListParams = { limit?: number; cursor?: string }

export type UpdateMePayload = {
  name?: string
  lastname?: string
  username?: string
  bio?: string
  phone?: string
  isPrivate?: boolean
  birthdate?: string
}

type ReactNativeFile = { uri: string; name: string; type: string }

// O `FormData` do React Native aceita `{ uri, name, type }` nativamente como
// valor de campo de arquivo, mas as tipagens DOM padrão só permitem
// `string | Blob`. Adicionamos um overload pra refletir o runtime do RN.
declare global {
  interface FormData {
    append(name: string, value: ReactNativeFile): void
  }
}

function buildAvatarFile(uri: string): ReactNativeFile {
  const filename = uri.split('/').pop() ?? 'avatar.jpg'
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  const type = ext === 'png' ? 'image/png' : 'image/jpeg'
  return { uri, name: filename, type }
}

export const usersService = {
  getMe: (): Promise<UserProfile> => api.get('/users/me').then(r => r.data),

  getById: (id: string): Promise<UserProfile> =>
    api.get(`/users/${id}`).then(r => r.data),

  updateMe: (data: UpdateMePayload): Promise<UserProfile> =>
    api.put('/users/me', data).then(r => r.data),

  uploadAvatar: (uri: string): Promise<UserProfile> => {
    const form = new FormData()
    form.append('avatar', buildAvatarFile(uri))
    return api
      .patch('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },

  getUserEvents: (
    userId: string,
    { limit = 20, cursor }: ListParams = {},
  ): Promise<CursorPaginatedResponse<UserEventSummary>> =>
    api
      .get(`/users/${userId}/events`, {
        params: { limit, ...(cursor ? { cursor } : {}) },
      })
      .then(r => r.data),
}
