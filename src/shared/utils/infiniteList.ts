import type { InfiniteData } from '@tanstack/react-query'
import type { CursorPaginatedResponse } from '@/shared/types'

type Identified = { id: string }
type InfiniteCache<T> = InfiniteData<CursorPaginatedResponse<T>>

// Helper pra optimistic remove em listas paginadas — ver CLAUDE.md →
// "Tratamento de erros e feedback ao usuário".
export function removeFromInfiniteList<T extends Identified>(
  cache: InfiniteCache<T> | undefined,
  itemId: string,
): InfiniteCache<T> | undefined {
  if (!cache) return cache
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.filter(item => item.id !== itemId),
    })),
  }
}
