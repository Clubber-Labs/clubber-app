import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { UserProfile } from '@/shared/types'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { userKeys } from '@/features/users/hooks/cacheKeys'
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

function setProfileRadius(queryClient: QueryClient, km: number) {
  queryClient.setQueryData<UserProfile>(userKeys.me, prev =>
    prev ? { ...prev, notifyRadiusKm: km } : prev,
  )
}

export function useNotificationPrefs() {
  const queryClient = useQueryClient()
  const { data: profile } = useMyProfile()
  const storedRadius = useNotificationPrefsStore(s => s.notifyRadiusKm)
  const setRadius = useNotificationPrefsStore(s => s.setRadius)

  // /users/me é a fonte da verdade quando o backend expõe o campo; backends
  // antigos não enviam — aí vale o último valor salvo localmente (o store
  // também cobre o intervalo offline até o profile carregar).
  const notifyRadiusKm = profile?.notifyRadiusKm ?? storedRadius

  // Otimista com revert silencioso (padrão do projeto), espelhado no store e
  // no cache do perfil; a resposta do PATCH é a autoridade final.
  const saveRadius = useCallback(
    async (km: number) => {
      const next = clampRadiusKm(km)
      if (next === notifyRadiusKm) return
      const previousStore = useNotificationPrefsStore.getState().notifyRadiusKm
      const previousProfile = queryClient.getQueryData<UserProfile>(userKeys.me)

      setRadius(next)
      setProfileRadius(queryClient, next)
      try {
        const result = await notificationsService.updateNotificationPrefs(next)
        setRadius(result.notifyRadiusKm)
        setProfileRadius(queryClient, result.notifyRadiusKm)
      } catch {
        setRadius(previousStore)
        if (previousProfile) {
          queryClient.setQueryData(userKeys.me, previousProfile)
        }
      }
    },
    [notifyRadiusKm, queryClient, setRadius],
  )

  return { notifyRadiusKm, saveRadius }
}
