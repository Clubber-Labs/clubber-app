import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { getToken } from '@/shared/lib/secureStore'
import { notificationSocket } from '../lib/notificationSocket'
import {
  applyIncomingNotification,
  resyncNotifications,
} from '../lib/realtimeCache'
import type { AppNotification } from '../schemas/notificationSchema'

// Liga o socket de notificações ao ciclo de vida (foreground/background) e
// roteia o frame pro cache do TanStack Query. `onAuthError` vem da camada app.
export function useNotificationsRealtime(onAuthError: () => void) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handlers = {
      onNotification: (n: AppNotification) =>
        applyIncomingNotification(queryClient, n),
      onReconnect: () => resyncNotifications(queryClient),
      onAuthError,
    }

    notificationSocket.start(getToken, handlers)

    // Conecta em foreground, fecha em background.
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') notificationSocket.start(getToken, handlers)
      else if (state === 'background') notificationSocket.stop()
    })

    return () => {
      sub.remove()
      notificationSocket.stop()
    }
  }, [onAuthError, queryClient])
}
