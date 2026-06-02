import { useEffect, useState } from 'react'
import * as Location from 'expo-location'

// Posição ao vivo (foreground) só pra alimentar o marcador do usuário no mapa.
// Throttled (distance/time) pra poupar bateria; cleanup no unmount. NÃO dispara
// busca de eventos (essa continua por bbox). Passe `enabled` quando a permissão
// já estiver concedida — não pede permissão aqui.
export function useUserLiveLocation(enabled: boolean): [number, number] | null {
  const [coords, setCoords] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let sub: Location.LocationSubscription | null = null

    async function start() {
      try {
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          pos => {
            if (!cancelled) {
              setCoords([pos.coords.longitude, pos.coords.latitude])
            }
          },
        )
      } catch {
        // Sem permissão / GPS off — o marcador some, sem crash.
      }
    }
    start()

    return () => {
      cancelled = true
      sub?.remove()
    }
  }, [enabled])

  return coords
}
