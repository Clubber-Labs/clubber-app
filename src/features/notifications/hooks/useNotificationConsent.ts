import { useCallback } from 'react'
import * as Location from 'expo-location'
import { useConsent } from '@/features/privacy/hooks/useConsent'
import { enablePush, disablePush } from '../lib/pushRegistration'
import { syncLocationOnce } from '../lib/locationSync'
import { useOsPermissions } from './useOsPermissions'

// Orquestra o fluxo consentimento → permissão do SO → registro/sync, tirando
// essa sequência da tela (regra do projeto: tela não chama service/lib).
// LGPD: o opt-in é registrado ANTES de qualquer prompt do SO; updateConsent é
// otimista e nunca rejeita (o useConsent re-sincroniza sozinho em falha), então
// o toggle reflete o estado local na hora. O pós-consentimento (registro de
// token, sync de localização) é best-effort: falha de rede aqui é recuperada
// pelo sync de boot/foreground do NotificationsMount.
export function useNotificationConsent() {
  const { consent, updateConsent } = useConsent()
  const osPermissions = useOsPermissions()
  const refreshOsPermissions = osPermissions.refresh

  const togglePush = useCallback(
    async (value: boolean) => {
      await updateConsent({ pushNotifications: value })
      try {
        if (value) await enablePush()
        else await disablePush()
      } catch {
        // Best-effort — usePushRegistration reconcilia no próximo foreground.
      }
      await refreshOsPermissions()
    },
    [refreshOsPermissions, updateConsent],
  )

  const toggleLocation = useCallback(
    async (value: boolean) => {
      await updateConsent({ locationPrecise: value })
      if (value) {
        try {
          const permission = await Location.requestForegroundPermissionsAsync()
          if (permission.granted) void syncLocationOnce()
        } catch {
          // Best-effort — useLocationSync tenta no próximo foreground.
        }
      }
      await refreshOsPermissions()
    },
    [refreshOsPermissions, updateConsent],
  )

  return {
    pushConsent: consent.pushNotifications,
    locationConsent: consent.locationPrecise,
    osPush: osPermissions.push,
    osLocation: osPermissions.location,
    togglePush,
    toggleLocation,
  }
}
