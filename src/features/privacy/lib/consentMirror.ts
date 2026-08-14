import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { consentService } from '../services/consentService'
import { useConsentStore } from '../store/consentStore'

const LAST_SENT_KEY = 'clubber-consent-mirror-v1'

type DevicePermissions = {
  locationPrecise: boolean
  pushNotifications: boolean
}

/** Lê o estado REAL das permissões. Nunca pede — só consulta. */
export async function readDevicePermissions(): Promise<DevicePermissions> {
  const [location, push] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Notifications.getPermissionsAsync(),
  ])
  return {
    locationPrecise: location.status === 'granted',
    pushNotifications: push.status === 'granted',
  }
}

async function readLastSent(): Promise<DevicePermissions | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SENT_KEY)
    return raw ? (JSON.parse(raw) as DevicePermissions) : null
  } catch {
    return null
  }
}

/**
 * Espelha no servidor a permissão do SISTEMA. O usuário pode mudá-la nos
 * Ajustes sem passar pelo app, e o servidor não fica sabendo sozinho.
 *
 * Chamar: depois do prompt nativo responder, quando o app volta ao foreground,
 * e no primeiro login de um device (onde não há último valor guardado).
 *
 * Só vai à rede quando diverge do último enviado — o backend ignora update sem
 * mudança, mas a rede não.
 */
export async function syncConsentMirror(): Promise<void> {
  const current = await readDevicePermissions()
  const lastSent = await readLastSent()
  if (
    lastSent &&
    lastSent.locationPrecise === current.locationPrecise &&
    lastSent.pushNotifications === current.pushNotifications
  ) {
    return
  }

  try {
    const record = await consentService.update(current)
    useConsentStore.getState().hydrate(record)
    await AsyncStorage.setItem(LAST_SENT_KEY, JSON.stringify(current))
  } catch {
    // Sem rede: o próximo foreground tenta de novo. Nada aqui bloqueia o app.
  }
}

/** Carrega o registro do servidor pro store (marketing, versão, revogação). */
export async function hydrateConsentRecord(): Promise<void> {
  try {
    const record = await consentService.get()
    useConsentStore.getState().hydrate(record)
  } catch {
    // Mantém o que veio do storage local até a próxima tentativa.
  }
}

/** Logout: o próximo login (outra conta, ou a mesma) re-espelha do zero. */
export async function clearConsentMirror(): Promise<void> {
  await AsyncStorage.removeItem(LAST_SENT_KEY).catch(() => {})
}
