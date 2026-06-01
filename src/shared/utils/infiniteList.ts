import type { InfiniteData } from '@tanstack/react-query'
import type { CursorPaginatedResponse } from '@/shared/types'

type Identified = { id: string }
type InfiniteCache<T> = InfiniteData<CursorPaginatedResponse<T>>

// Achata as páginas de um infinite query removendo ids repetidos (mantém a 1ª
// ocorrência, preservando a ordem). O feed por cursor pode trazer o mesmo evento
// em páginas distintas — empates na ordenação por proximidade/recência ou a mesma
// entidade ressurgindo por sinais sociais diferentes. Sem dedup, o FlatList quebra
// com "two children with the same key".
export function flattenInfiniteList<T extends Identified>(
  cache: InfiniteCache<T> | undefined,
): T[] {
  if (!cache) return []
  const seen = new Set<string>()
  const items: T[] = []
  for (const page of cache.pages) {
    for (const item of page.data) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      items.push(item)
    }
  }
  return items
}

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
