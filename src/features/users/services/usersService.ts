import { api } from '@/shared/lib/api'
import { buildImageFile } from '@/shared/utils/imageUpload'
import type { BackendLocale } from '@/shared/i18n'
import type {
  CursorPaginatedResponse,
  UserPhoto,
  UserProfile,
  UserEventSummary,
} from '@/shared/types'
import type { SearchUserItem } from '../schemas/searchUserSchema'

type ListParams = { limit?: number; cursor?: string }

export type UpdateMePayload = {
  name?: string
  lastname?: string
  username?: string
  bio?: string
  phone?: string
  isPrivate?: boolean
  birthdate?: string
  // PUT substitui o estado completo: enviar a lista (incl. []) recria as
  // preferências; omitir a chave não altera. Por isso é opcional aqui.
  preferredCategories?: string[]
  preferredSubcategories?: string[]
  // Preferências de produto (opt-out). Moram no perfil, não em /consent —
  // mandá-las num PATCH /consent é erro de validação.
  socialFeed?: boolean
  socialVisibility?: boolean
  analytics?: boolean
  // Idioma explícito da interface (null volta a seguir o aparelho). O enum do
  // backend é regional: 'pt' dá 400 — use toBackendLocale.
  localePreference?: BackendLocale | null
}

export type CreatePhotoPayload = {
  uris: string[]
  caption?: string
  eventId?: string
}

export const usersService = {
  getMe: (): Promise<UserProfile> => api.get('/users/me').then(r => r.data),

  getById: (id: string): Promise<UserProfile> =>
    api.get(`/users/${id}`).then(r => r.data),

  // PUT /users/me cai no handler de /users/:id no Fastify (ordem de registro
  // das rotas no backend). Passar o id real evita o 400 de validação UUID.
  update: (id: string, data: UpdateMePayload): Promise<UserProfile> =>
    api.put(`/users/${id}`, data).then(r => r.data),

  uploadAvatar: (uri: string): Promise<UserProfile> => {
    const form = new FormData()
    form.append('avatar', buildImageFile(uri, 'avatar.jpg'))
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

  getUserPhotos: (
    userId: string,
    { limit = 30, cursor }: ListParams = {},
  ): Promise<CursorPaginatedResponse<UserPhoto>> =>
    api
      .get(`/users/${userId}/photos`, {
        params: { limit, ...(cursor ? { cursor } : {}) },
      })
      .then(r => r.data),

  // Um request só, atômico: a publicação nasce com todas as imagens ou não
  // nasce — o mural nunca mostra um tile vazio de upload que falhou no meio.
  createPhoto: ({
    uris,
    caption,
    eventId,
  }: CreatePhotoPayload): Promise<UserPhoto> => {
    const form = new FormData()
    uris.forEach((uri, i) =>
      form.append('images', buildImageFile(uri, `photo-${i}.jpg`)),
    )
    if (caption) form.append('caption', caption)
    if (eventId) form.append('eventId', eventId)
    return api
      .post('/users/me/photos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },

  deletePhoto: (photoId: string): Promise<void> =>
    api.delete(`/users/me/photos/${photoId}`).then(() => undefined),

  // Rota PÚBLICA (o cadastro ainda não tem token) e case-sensitive, espelhando
  // o predicado do POST /users: normalizar aqui faria o app dizer "indisponível"
  // pra um username que o cadastro aceitaria.
  checkUsernameAvailability: (
    username: string,
    signal?: AbortSignal,
  ): Promise<{ available: boolean }> =>
    api
      .get('/users/username-available', { params: { username }, signal })
      .then(r => r.data),

  searchUsers: ({
    q,
    cursor,
    signal,
  }: {
    q: string
    cursor?: string
    signal?: AbortSignal
  }): Promise<CursorPaginatedResponse<SearchUserItem>> =>
    api
      .get('/users/search', {
        params: { q, ...(cursor ? { cursor } : {}) },
        signal,
      })
      .then(r => r.data),
}
