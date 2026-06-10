import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { notificationsService } from '../services/notificationsService'
import {
  deleteRegisteredPushToken,
  getRegisteredPushToken,
  saveRegisteredPushToken,
} from './storage'

export type EnablePushResult = 'registered' | 'denied' | 'unavailable'

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notificações',
    importance: Notifications.AndroidImportance.HIGH,
  })
}

// Simulador iOS não emite token e builds sem FCM lançam — nunca deixar o
// registro derrubar o app por isso.
async function getExpoPushToken(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as
    | string
    | undefined
  if (!projectId) return null
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
    return data
  } catch {
    return null
  }
}

// Registra (ou rotaciona) o token no backend. O token antigo é removido
// best-effort antes do novo — DELETE /devices é idempotente.
async function registerToken(token: string): Promise<void> {
  const previous = await getRegisteredPushToken()
  if (previous === token) return
  if (previous) {
    try {
      await notificationsService.removeDevice(previous)
    } catch {
      // Best-effort: o backend invalida tokens mortos via push receipts.
    }
  }
  await notificationsService.registerDevice(
    token,
    Platform.OS === 'ios' ? 'ios' : 'android',
  )
  await saveRegisteredPushToken(token)
}

// Registro silencioso de boot/foreground: roda só quando o usuário JÁ
// consentiu E a permissão do SO já foi concedida — nunca abre prompt aqui
// (o prompt acontece apenas na ação explícita do toggle, via enablePush).
// Cobre re-registro quando o token do Expo rotaciona entre sessões.
export async function syncPushRegistration(): Promise<void> {
  if (!Device.isDevice) return
  const permissions = await Notifications.getPermissionsAsync()
  if (!permissions.granted) return
  await ensureAndroidChannel()
  const token = await getExpoPushToken()
  if (!token) return
  await registerToken(token)
}

// Fluxo do toggle de consentimento: pede a permissão do SO (primeira vez) e
// registra. 'denied' inclui o caso "negada e não pode perguntar de novo" —
// a UI oferece abrir as configurações do sistema.
export async function enablePush(): Promise<EnablePushResult> {
  if (!Device.isDevice) return 'unavailable'
  let permissions = await Notifications.getPermissionsAsync()
  if (!permissions.granted) {
    if (!permissions.canAskAgain) return 'denied'
    permissions = await Notifications.requestPermissionsAsync()
    if (!permissions.granted) return 'denied'
  }
  await ensureAndroidChannel()
  const token = await getExpoPushToken()
  if (!token) return 'unavailable'
  await registerToken(token)
  return 'registered'
}

// Revogação efetiva: remove o device do backend e o registro local. Mesmo
// com o backend já bloqueando envios sem consentimento, o token não fica
// órfão registrado (defesa em profundidade).
export async function disablePush(): Promise<void> {
  const previous = await getRegisteredPushToken()
  if (!previous) return
  try {
    await notificationsService.removeDevice(previous)
  } catch {
    // Best-effort — sem rede agora, o backend invalida via receipts depois.
  }
  await deleteRegisteredPushToken()
}
