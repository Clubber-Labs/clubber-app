import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { AppNotification } from '../schemas/notificationSchema'
import { notificationKeys } from '../hooks/cacheKeys'

type ListCache = InfiniteData<CursorPaginatedResponse<AppNotification>>
type CountCache = { count: number }

// Aplica uma notificação recebida pelo WS: prepend na página 0 (dedup por id —
// eco de reconexão não duplica nem infla o badge) e incrementa o unread-count.
export function applyIncomingNotification(
  queryClient: QueryClient,
  notification: AppNotification,
) {
  const cache = queryClient.getQueryData<ListCache>(notificationKeys.list)

  if (cache) {
    const exists = cache.pages.some(page =>
      page.data.some(n => n.id === notification.id),
    )
    if (exists) return

    const [first, ...rest] = cache.pages
    if (first) {
      queryClient.setQueryData<ListCache>(notificationKeys.list, {
        ...cache,
        pages: [{ ...first, data: [notification, ...first.data] }, ...rest],
      })
    }
  }

  if (notification.readAt !== null) return
  const count = queryClient.getQueryData<CountCache>(
    notificationKeys.unreadCount,
  )
  if (count) {
    queryClient.setQueryData<CountCache>(notificationKeys.unreadCount, {
      count: count.count + 1,
    })
  } else {
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
  }
}

// Reconexão não tem replay — rebusca lista e badge via REST. Cobre também o
// retorno background→foreground (o socket trata o open pós-stop como reconexão).
export function resyncNotifications(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: notificationKeys.list })
  queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
}
