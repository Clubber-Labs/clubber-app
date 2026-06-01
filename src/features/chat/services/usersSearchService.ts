import { api } from '@/shared/lib/api'
import type { CursorPaginatedResponse, UserMini } from '@/shared/types'

// Busca de usuários para iniciar conversa / adicionar ao grupo. Reusa o endpoint
// GET /users/search via o cliente compartilhado — chat não importa de features/users.
// Só os campos de UserMini são usados (presentes em qualquer variante do retorno).
export const usersSearchService = {
  search: ({
    q,
    cursor,
    signal,
  }: {
    q: string
    cursor?: string
    signal?: AbortSignal
  }): Promise<CursorPaginatedResponse<UserMini>> =>
    api
      .get('/users/search', {
        params: { q, ...(cursor ? { cursor } : {}) },
        signal,
      })
      .then(r => r.data),
}
