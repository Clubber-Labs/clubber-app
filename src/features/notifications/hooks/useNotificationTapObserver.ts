import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { pushDataSchema } from '../schemas/notificationSchema'
import { useOpenNotification } from './useOpenNotification'

// Tap num push do SO (background e cold start). O payload NÃO é confiável —
// só os campos validados pelo zod roteiam (whitelist em openFromPush); nunca
// navega pra URL vinda do payload. Qualquer coisa fora do contrato cai na
// central.
export function useNotificationTapObserver() {
  const router = useRouter()
  const { openFromPush } = useOpenNotification()

  useEffect(() => {
    function handleResponse(response: Notifications.NotificationResponse) {
      const parsed = pushDataSchema.safeParse(
        response.notification.request.content.data,
      )
      if (parsed.success) openFromPush(parsed.data)
      else router.push('/notifications')
    }

    // Cold start: o app foi aberto por um tap. O clear evita que uma abertura
    // normal futura re-processe o mesmo response (ele persiste entre sessões).
    const lastResponse = Notifications.getLastNotificationResponse()
    if (lastResponse) {
      Notifications.clearLastNotificationResponse()
      handleResponse(lastResponse)
    }

    const sub =
      Notifications.addNotificationResponseReceivedListener(handleResponse)
    return () => sub.remove()
  }, [openFromPush, router])
}
