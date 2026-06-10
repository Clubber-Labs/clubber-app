import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { AppNotification } from '../schemas/notificationSchema'
import { notificationsService } from '../services/notificationsService'
import { notificationKeys } from './cacheKeys'

type ListCache = InfiniteData<CursorPaginatedResponse<AppNotification>>
type CountCache = { count: number }

function setReadAt(
  cache: ListCache,
  predicate: (n: AppNotification) => boolean,
): ListCache {
  const readAt = new Date().toISOString()
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.map(n =>
        predicate(n) && n.readAt === null ? { ...n, readAt } : n,
      ),
    })),
  }
}

async function snapshotCaches(queryClient: QueryClient) {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: notificationKeys.list }),
    queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount }),
  ])
  return {
    prevList: queryClient.getQueryData<ListCache>(notificationKeys.list),
    prevCount: queryClient.getQueryData<CountCache>(
      notificationKeys.unreadCount,
    ),
  }
}

type Snapshot = Awaited<ReturnType<typeof snapshotCaches>>

function restoreCaches(queryClient: QueryClient, ctx: Snapshot | undefined) {
  if (ctx?.prevList) {
    queryClient.setQueryData(notificationKeys.list, ctx.prevList)
  }
  if (ctx?.prevCount) {
    queryClient.setQueryData(notificationKeys.unreadCount, ctx.prevCount)
  }
}

function invalidateCaches(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: notificationKeys.list })
  queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
}

// Padrão canônico de mutation otimista (CLAUDE.md): a linha vira "lida" e o
// badge decrementa na hora; em erro, reverte silenciosamente.
export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onMutate: async id => {
      const ctx = await snapshotCaches(queryClient)
      const wasUnread =
        ctx.prevList?.pages.some(page =>
          page.data.some(n => n.id === id && n.readAt === null),
        ) ?? false
      if (ctx.prevList) {
        queryClient.setQueryData(
          notificationKeys.list,
          setReadAt(ctx.prevList, n => n.id === id),
        )
      }
      if (wasUnread && ctx.prevCount) {
        queryClient.setQueryData(notificationKeys.unreadCount, {
          count: Math.max(0, ctx.prevCount.count - 1),
        })
      }
      return ctx
    },
    onError: (_err, _id, ctx) => restoreCaches(queryClient, ctx),
    onSettled: () => invalidateCaches(queryClient),
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onMutate: async () => {
      const ctx = await snapshotCaches(queryClient)
      if (ctx.prevList) {
        queryClient.setQueryData(
          notificationKeys.list,
          setReadAt(ctx.prevList, () => true),
        )
      }
      queryClient.setQueryData(notificationKeys.unreadCount, { count: 0 })
      return ctx
    },
    onError: (_err, _vars, ctx) => restoreCaches(queryClient, ctx),
    onSettled: () => invalidateCaches(queryClient),
  })
}
