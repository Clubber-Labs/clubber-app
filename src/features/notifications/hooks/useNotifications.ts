import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import { useLocale } from '@/shared/hooks/useLocale'
import { notificationsService } from '../services/notificationsService'
import { notificationKeys } from './cacheKeys'

export function useNotifications() {
  // Passar o locale explicitamente (em vez de deixar a chave lê-lo sozinha) é o
  // que assina a troca de idioma: sem re-render, a query ficaria na chave velha.
  const locale = useLocale()

  const query = useInfiniteQuery({
    queryKey: notificationKeys.list(locale),
    queryFn: ({ pageParam }) =>
      notificationsService.list({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? null,
  })

  const notifications = useMemo(
    () => flattenInfiniteList(query.data),
    [query.data],
  )

  return { ...query, notifications }
}
