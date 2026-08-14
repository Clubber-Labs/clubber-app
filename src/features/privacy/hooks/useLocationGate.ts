import { useCallback } from 'react'
import { useConfirm } from '@/shared/lib/confirm'
import { syncConsentMirror } from '../lib/consentMirror'
import { useConsentedLocation } from './useConsentedLocation'

/**
 * Desfecho de uma tentativa de obter localização.
 * `refused` = a pessoa disse não (ao priming ou ao prompt do sistema, que ainda
 * pode voltar) — insistir seria assédio. `denied` = negativa definitiva do SO:
 * só os ajustes resolvem. `revoked` = Art. 18: resolve-se dentro do app.
 */
export type LocationGateResult =
  | 'ready'
  | 'refused'
  | 'denied'
  | 'revoked'
  | 'error'

type PrimingPrompt = { title: string; message: string }

/**
 * Porta de entrada da localização: priming antes do prompt nativo, e espelho
 * depois dele.
 *
 * O priming existe porque no iOS o prompt do sistema aparece UMA vez — negado,
 * o único caminho de volta são os Ajustes. Quem recusa o priming não queima
 * essa chance: dá pra perguntar de novo em outro contexto.
 */
export function useLocationGate() {
  const { coords, status, request } = useConsentedLocation()
  const confirm = useConfirm()

  const ensure = useCallback(
    async (prompt: PrimingPrompt): Promise<LocationGateResult> => {
      if (status === 'ready') return 'ready'
      if (status === 'revoked') return 'revoked'
      if (status === 'denied') return 'denied'

      const ok = await confirm({ ...prompt, confirmLabel: 'Permitir' })
      if (!ok) return 'refused'

      const result = await request()
      // Espelha o desfecho no servidor — concedido ou negado, os dois são
      // estado do dispositivo que o backend precisa conhecer.
      void syncConsentMirror()

      if (result === 'ready') return 'ready'
      if (result === 'error') return 'error'
      if (result === 'denied') return 'denied'
      // Continua 'askable' depois do prompt = dispensado sem conceder (Android).
      return 'refused'
    },
    [status, confirm, request],
  )

  return { coords, status, ensure }
}
