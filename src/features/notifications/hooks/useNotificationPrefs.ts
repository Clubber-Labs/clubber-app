import { useCallback } from 'react'
import { notificationsService } from '../services/notificationsService'
import {
  useNotificationPrefsStore,
  NOTIFY_RADIUS_MIN_KM,
  NOTIFY_RADIUS_MAX_KM,
} from '../store/notificationPrefsStore'

// Validação client-side espelhando o servidor (2..50) — o backend continua
// sendo a autoridade.
function clampRadiusKm(km: number): number {
  return Math.min(
    NOTIFY_RADIUS_MAX_KM,
    Math.max(NOTIFY_RADIUS_MIN_KM, Math.round(km)),
  )
}

export function useNotificationPrefs() {
  const notifyRadiusKm = useNotificationPrefsStore(s => s.notifyRadiusKm)
  const setRadius = useNotificationPrefsStore(s => s.setRadius)

  // Otimista com revert silencioso (padrão do projeto); a resposta do PATCH
  // é a autoridade final sobre o valor persistido.
  const saveRadius = useCallback(
    async (km: number) => {
      const next = clampRadiusKm(km)
      const previous = useNotificationPrefsStore.getState().notifyRadiusKm
      if (next === previous) return
      setRadius(next)
      try {
        const result = await notificationsService.updateNotificationPrefs(next)
        setRadius(result.notifyRadiusKm)
      } catch {
        setRadius(previous)
      }
    },
    [setRadius],
  )

  return { notifyRadiusKm, saveRadius }
}
