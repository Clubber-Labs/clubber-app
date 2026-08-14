import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useConsentStore } from '../store/consentStore'
import { consentService, type ConsentFields } from '../services/consentService'
import { hydrateConsentRecord } from '../lib/consentMirror'
import { userKeys } from '@/features/users/hooks/cacheKeys'

/**
 * Estado e ações do consentimento. Não existe mais "conceder": o registro nasce
 * com a conta, e toda escrita é um PATCH parcial.
 */
export function useConsent() {
  const queryClient = useQueryClient()

  const locationPrecise = useConsentStore(s => s.locationPrecise)
  const pushNotifications = useConsentStore(s => s.pushNotifications)
  const marketing = useConsentStore(s => s.marketing)
  const surveys = useConsentStore(s => s.surveys)
  const consentVersion = useConsentStore(s => s.consentVersion)
  const revokedAt = useConsentStore(s => s.revokedAt)
  const setMany = useConsentStore(s => s.setMany)

  /**
   * Otimista com reconciliação: o switch vira na hora, mas se o PATCH falhar
   * ele volta e quem chama mostra o erro. Numa tela de privacidade, UI dizendo
   * que gravou sem ter gravado é grave.
   */
  const updateConsent = useCallback(
    async (patch: Partial<ConsentFields>): Promise<boolean> => {
      const before = useConsentStore.getState()
      const previous = Object.fromEntries(
        Object.keys(patch).map(key => [
          key,
          before[key as keyof ConsentFields],
        ]),
      ) as Partial<ConsentFields>

      setMany(patch)
      try {
        const record = await consentService.update(patch)
        useConsentStore.getState().hydrate(record)
        return true
      } catch {
        setMany(previous)
        return false
      }
    },
    [setMany],
  )

  /**
   * Art. 18: desliga consentimentos E as preferências de produto do perfil, e
   * apaga a localização guardada. O perfil precisa ser recarregado — os toggles
   * de preferência ficaram desatualizados na tela.
   */
  const revokeAll = useCallback(async (): Promise<boolean> => {
    try {
      await consentService.revokeAll()
      await hydrateConsentRecord()
      await queryClient.invalidateQueries({ queryKey: userKeys.me })
      return true
    } catch {
      return false
    }
  }, [queryClient])

  const exportData = useCallback(() => consentService.export(), [])

  return {
    consent: {
      locationPrecise,
      pushNotifications,
      marketing,
      surveys,
      consentVersion,
      revokedAt,
    },
    isRevoked: !!revokedAt,
    updateConsent,
    revokeAll,
    exportData,
  }
}
