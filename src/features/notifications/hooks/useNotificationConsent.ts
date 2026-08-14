import { useCallback } from 'react'
import { Linking } from 'react-native'
import * as Location from 'expo-location'
import { syncConsentMirror } from '@/features/privacy/lib/consentMirror'
import { enablePush } from '../lib/pushRegistration'
import { syncLocationOnce } from '../lib/locationSync'
import { useOsPermissions } from './useOsPermissions'

/**
 * Permissões do dispositivo na tela de notificações.
 *
 * Não são toggles do app: quem decide é o SO, e um switch que o app não
 * consegue honrar faz o usuário arrastar sem nada acontecer. O que resta ao app
 * é pedir (quando o sistema ainda deixa perguntar) ou abrir os Ajustes — e
 * espelhar o desfecho no servidor.
 */
export function useNotificationConsent() {
  const osPermissions = useOsPermissions()
  const refreshOsPermissions = osPermissions.refresh

  const enableNotifications = useCallback(async () => {
    // 'denied' aqui é definitivo (o useOsPermissions já resolve canAskAgain):
    // pedir de novo não abre prompt nenhum, só os Ajustes resolvem.
    if (osPermissions.push === 'denied') {
      Linking.openSettings()
      return
    }
    await enablePush()
    void syncConsentMirror()
    await refreshOsPermissions()
  }, [osPermissions.push, refreshOsPermissions])

  const enableLocation = useCallback(async () => {
    if (osPermissions.location === 'denied') {
      Linking.openSettings()
      return
    }
    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (permission.granted) void syncLocationOnce()
    } catch {
      // Best-effort — useLocationSync tenta no próximo foreground.
    }
    void syncConsentMirror()
    await refreshOsPermissions()
  }, [osPermissions.location, refreshOsPermissions])

  return {
    osPush: osPermissions.push,
    osLocation: osPermissions.location,
    enableNotifications,
    enableLocation,
  }
}
