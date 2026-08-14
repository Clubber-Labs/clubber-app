import { useCallback } from 'react'
import { syncConsentMirror } from '../lib/consentMirror'
import { useConsentedLocation } from './useConsentedLocation'

/**
 * Desfecho de uma tentativa de obter localização.
 * `refused` = a pessoa dispensou o prompt do sistema, que ainda pode voltar —
 * insistir seria assédio. `denied` = negativa definitiva do SO: só os ajustes
 * resolvem. `revoked` = Art. 18: resolve-se dentro do app.
 */
export type LocationGateResult =
  | 'ready'
  | 'refused'
  | 'denied'
  | 'revoked'
  | 'error'

/**
 * Acesso à localização com espelho automático.
 *
 * O priming NÃO mora aqui: quem convida é a UI (o card e o banner do mapa), que
 * mostra o valor com o mapa na tela. Um confirm genérico antes do prompt do
 * sistema só somava um passo — eram dois pedidos seguidos pela mesma coisa.
 */
export function useLocationGate() {
  const { coords, status, request } = useConsentedLocation()

  /** Dispara o prompt nativo e espelha o desfecho no servidor. */
  const grant = useCallback(async (): Promise<LocationGateResult> => {
    const result = await request()
    // Concedido ou negado, os dois são estado do dispositivo que o backend
    // precisa conhecer.
    void syncConsentMirror()

    if (result === 'ready') return 'ready'
    if (result === 'error') return 'error'
    if (result === 'denied') return 'denied'
    // Continua 'askable' depois do prompt = dispensado sem conceder (Android).
    return 'refused'
  }, [request])

  return { coords, status, grant }
}
