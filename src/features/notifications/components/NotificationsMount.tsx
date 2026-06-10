import { useEffect } from 'react'
import { configureNotificationHandler } from '../lib/notificationHandler'
import { useNotificationsRealtime } from '../hooks/useNotificationsRealtime'
import { usePushRegistration } from '../hooks/usePushRegistration'
import { useNotificationTapObserver } from '../hooks/useNotificationTapObserver'
import { useLocationSync } from '../hooks/useLocationSync'

type Props = {
  onAuthError: () => void
}

// Montado no _layout quando autenticado (mesmo padrão do ChatRealtimeMount):
// WS de notificações, registro de push e sync de localização gated por
// consentimento, e deep-link de tap. Desmontar (logout) derruba o socket e
// os listeners.
export function NotificationsMount({ onAuthError }: Props) {
  useEffect(() => {
    configureNotificationHandler()
  }, [])

  useNotificationsRealtime(onAuthError)
  usePushRegistration()
  useNotificationTapObserver()
  useLocationSync()

  return null
}
