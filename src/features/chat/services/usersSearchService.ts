import { api } from '@/shared/lib/api'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { PickablePerson } from '../types'

// Busca de usuários para iniciar conversa / adicionar ao grupo. Reusa o endpoint
// GET /users/search via o cliente compartilhado — chat não importa de features/users.
// `isPrivate`/`followStatus` vêm nas duas variantes do retorno (full e reduced) e
// são o que permite marcar quem o backend vai recusar antes do toque.
export const usersSearchService = {
  search: ({
    q,
    cursor,
    signal,
  }: {
    q: string
    cursor?: string
    signal?: AbortSignal
  }): Promise<CursorPaginatedResponse<PickablePerson>> =>
    api
      .get('/users/search', {
        params: { q, ...(cursor ? { cursor } : {}) },
        signal,
      })
      .then(r => r.data),
}
