import { useCallback } from 'react'
import { useConfirm } from '@/shared/lib/confirm'
import { useConsent } from './useConsent'
import { useConsentedLocation } from './useConsentedLocation'

/**
 * Desfecho de uma tentativa de obter localização.
 * `refused` = a pessoa disse não (ao consentimento ou ao prompt do sistema, que
 * ainda pode ser reapresentado) — insistir seria assédio. `denied` = negativa
 * definitiva do sistema: só os ajustes resolvem.
 */
export type LocationGateResult = 'ready' | 'refused' | 'denied' | 'error'

type ConsentPrompt = { title: string; message: string }

/**
 * Porta de entrada da localização: encadeia consentimento (LGPD) e permissão do
 * sistema, nessa ordem, e devolve só o desfecho.
 *
 * Existe pra essa coreografia não morar na tela. Quem chama fica com o que é
 * seu — o texto do pedido, a câmera, e o que fazer com cada desfecho.
 */
export function useLocationGate() {
  const { coords, status, request } = useConsentedLocation()
  const { updateConsent } = useConsent()
  const confirm = useConfirm()

  const ensure = useCallback(
    async (prompt: ConsentPrompt): Promise<LocationGateResult> => {
      if (status === 'ready') return 'ready'
      // Negativa definitiva do sistema não tem o que pedir: quem chama decide
      // se manda pros ajustes.
      if (status === 'denied') return 'denied'

      if (status === 'unconsented') {
        const ok = await confirm({ ...prompt, confirmLabel: 'Permitir' })
        if (!ok) return 'refused'
        // Sem await: o estado local já virou e o PATCH tem retry próprio — o que
        // importa pra quem está esperando é o prompt do sistema sair agora.
        void updateConsent({ locationPrecise: true })
      }

      const result = await request()
      if (result === 'ready') return 'ready'
      if (result === 'error') return 'error'
      if (result === 'denied') return 'denied'
      // Continua 'askable' depois do prompt = dispensado sem conceder (Android).
      // Dá pra perguntar de novo no próximo toque, então não é 'denied'.
      return 'refused'
    },
    [status, confirm, updateConsent, request],
  )

  return { coords, status, ensure }
}
