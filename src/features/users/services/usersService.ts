import { api } from '@/shared/lib/api'
import { buildImageFile } from '@/shared/utils/imageUpload'
import type { BackendLocale } from '@/shared/i18n'
import type {
  CursorPaginatedResponse,
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
