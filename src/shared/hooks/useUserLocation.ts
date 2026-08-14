import { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'

type Coords = [number, number]
export type LocationStatus =
  /** Ainda resolvendo o estado da permissão. */
  | 'loading'
  /** Sem consentimento de localização precisa — o sistema nem foi consultado. */
  | 'unconsented'
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
   * Pede a permissão ao SISTEMA. Só a partir de um gesto explícito do usuário.
   * Ignora `allowed` de propósito: quem chama resolve o consentimento no mesmo
   * gesto, e o store pode não ter propagado quando o pedido sai.
   */
  request: () => Promise<LocationStatus>
}

/**
 * Posição atual do usuário, sem pedir nada na montagem — só CONSULTA o que já
 * foi decidido. O pedido virou ação explícita porque um prompt frio na abertura
 * gasta a única chance que existe: no iOS, negado uma vez, o app não pode
 * perguntar de novo — só resta mandar o usuário pros ajustes.
 *
 * `allowed` é o consentimento de localização precisa (LGPD). Vem por parâmetro,
 * e não do store, porque shared/ não importa de features/ — quem compõe os dois
 * é o useConsentedLocation. Mesma convenção do useUserLiveLocation(enabled).
 */
export function useUserLocation(allowed: boolean): Result {
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
    if (!allowed) {
      setStatus('unconsented')
      setCoords(null)
      return
    }
    void resolve(false)
  }, [allowed, resolve])

  const request = useCallback(() => resolve(true), [resolve])

  return { coords, status, request }
}
