import * as Location from 'expo-location'
import { useConsentStore } from '@/features/privacy/store/consentStore'
import { consentService } from '@/features/privacy/services/consentService'
import { isForbiddenError } from '@/shared/lib/apiError'
import { notificationsService } from '../services/notificationsService'
import { encodeGeohash6 } from './geohash'
import { getLastLocationSync, saveLastLocationSync } from './storage'

export const LOCATION_RESEND_INTERVAL_MS = 24 * 60 * 60 * 1000

// Decisão pura: reenvia se a célula mudou ou se o último envio está velho.
// O TTL do servidor é 90 dias — 24h mantém o dado fresco com folga sem
// martelar o backend a cada foreground.
export function shouldResendLocation(
  last: { geohash: string; sentAtMs: number } | null,
  geohash: string,
  nowMs: number,
): boolean {
  if (!last) return true
  if (last.geohash !== geohash) return true
  return nowMs - last.sentAtMs >= LOCATION_RESEND_INTERVAL_MS
}

// 403 = consentimento ausente/revogado no SERVIDOR (fonte da verdade) — o
// estado local estava defasado. Re-hidrata; o gate do hook para a coleta.
async function rehydrateConsent() {
  try {
    const record = await consentService.get()
    useConsentStore.getState().hydrate(record)
  } catch {
    // Sem rede: mantém o estado local; o próximo sync tenta de novo.
  }
}

let inFlight = false

// Lê a posição (accuracy Low — coarse basta pra célula de ~1,2km), converte
// em geohash no device e envia. A coordenada precisa nunca é logada nem
// persistida; só o geohash vai pro storage de throttle. Nunca abre prompt de
// permissão — isso é ação explícita do toggle na tela de configurações.
export async function syncLocationOnce(): Promise<void> {
  if (inFlight) return
  inFlight = true
  try {
    const permission = await Location.getForegroundPermissionsAsync()
    if (!permission.granted) return

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    })
    const geohash = encodeGeohash6(
      position.coords.latitude,
      position.coords.longitude,
    )
    if (!geohash) return

    const last = await getLastLocationSync()
    if (!shouldResendLocation(last, geohash, Date.now())) return

    await notificationsService.updateLocation(geohash)
    await saveLastLocationSync(geohash, Date.now())
  } catch (err) {
    if (isForbiddenError(err)) await rehydrateConsent()
    // Demais erros (rede, GPS desligado): silencioso — o próximo foreground
    // tenta de novo.
  } finally {
    inFlight = false
  }
}
