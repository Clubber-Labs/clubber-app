import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '../services/notificationsService'
import { notificationKeys } from './cacheKeys'

export function useUnreadCount() {
  const query = useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: notificationsService.unreadCount,
  })

  return { ...query, count: query.data?.count ?? 0 }
}
