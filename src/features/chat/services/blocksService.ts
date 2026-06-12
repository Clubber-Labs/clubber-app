import { api } from '@/shared/lib/api'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { Block } from '../types'

type ListParams = { limit?: number; cursor?: string }

export const blocksService = {
  block: (userId: string): Promise<void> =>
    api.post('/blocks', { userId }).then(() => undefined),

  unblock: (userId: string): Promise<void> =>
    api.delete(`/blocks/${userId}`).then(() => undefined),

  list: ({ limit = 20, cursor }: ListParams = {}): Promise<
    CursorPaginatedResponse<Block>
  > =>
    api
      .get('/blocks', {
        params: { limit, ...(cursor ? { cursor } : {}) },
      })
      .then(r => r.data),
}
