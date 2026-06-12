import * as Location from 'expo-location'

// Função de decisão pura (discriminated union): captura a posição UMA vez,
// só em foreground e só quando chamada — nada de watch/background (LGPD:
// minimização). A permissão do SO é pedida aqui, no momento do uso.
export type ForegroundLocationResult =
  | { kind: 'granted'; latitude: number; longitude: number }
  | { kind: 'denied' }
  | { kind: 'error' }

export async function getForegroundLocation(): Promise<ForegroundLocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (permission.status !== 'granted') return { kind: 'denied' }
    const pos = await Location.getCurrentPositionAsync({})
    return {
      kind: 'granted',
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    }
  } catch {
    return { kind: 'error' }
  }
}
