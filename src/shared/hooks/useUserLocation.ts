import { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'

type Coords = [number, number]
export type LocationStatus =
  /** Ainda resolvendo o estado da permissão. */
  | 'loading'
  /** Sistema ainda pode perguntar (nunca perguntou, ou negou e permite retry). */
  | 'askable'
  /** Negada de forma definitiva — só os ajustes do sistema resolvem. */
  | 'denied'
  | 'error'
  | 'ready'

type Result = {
  coords: Coords | null
  status: LocationStatus
  /**
   * Dispara o prompt NATIVO. Só a partir de um gesto explícito, e depois de um
   * priming — no iOS o prompt aparece uma única vez na vida do app.
   */
  request: () => Promise<LocationStatus>
}

/**
 * Posição atual do usuário. Na montagem apenas CONSULTA a permissão; nunca
 * pede. O pedido é ação explícita (request), atrás de um priming — ver
 * useLocationGate.
 */
export function useUserLocation(): Result {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<LocationStatus>('loading')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const resolve = useCallback(
    async (prompt: boolean): Promise<LocationStatus> => {
      try {
        const permission = prompt
          ? await Location.requestForegroundPermissionsAsync()
          : await Location.getForegroundPermissionsAsync()
        if (permission.status !== 'granted') {
          // 'undetermined' (nunca perguntado) não é negativa: mandar essa pessoa
          // pros ajustes seria absurdo, o que falta é o prompt. canAskAgain
          // separa os dois — no iOS ele cai pra false na primeira recusa.
          const next = permission.canAskAgain ? 'askable' : 'denied'
          if (mounted.current) setStatus(next)
          return next
        }
        const pos = await Location.getCurrentPositionAsync({})
        if (mounted.current) {
          setCoords([pos.coords.longitude, pos.coords.latitude])
          setStatus('ready')
        }
        return 'ready'
      } catch {
        if (mounted.current) setStatus('error')
        return 'error'
      }
    },
    [],
  )

  useEffect(() => {
    void resolve(false)
  }, [resolve])

  const request = useCallback(() => resolve(true), [resolve])

  return { coords, status, request }
}
