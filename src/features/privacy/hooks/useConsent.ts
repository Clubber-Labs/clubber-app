import { useCallback, useEffect } from 'react'
import { isAxiosError } from 'axios'
import { useConsentStore, selectNeedsVersionBump } from '../store/consentStore'
import {
  consentService,
  CONSENT_VERSION,
  type ConsentFields,
} from '../services/consentService'
import { useAuthStore } from '@/features/auth/store/authStore'

/**
 * Hook principal de consentimento.
 * - Carrega dados do backend ao logar (status 'unknown' → hydrate ou markPending)
 * - Sincroniza automaticamente via debounce 1.5s quando isSynced = false
 * - Expõe grantConsent, updateConsent, revokeAll, exportData, auditLog
 */
export function useConsent() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const consentStatus = useConsentStore(s => s.status)
  const isSynced = useConsentStore(s => s.isSynced)
  const needsVersionBump = useConsentStore(s =>
    selectNeedsVersionBump(s, CONSENT_VERSION),
  )

  // Campos reativos — cada um re-renderiza apenas quando seu valor muda
  const locationPrecise = useConsentStore(s => s.locationPrecise)
  const socialFeed = useConsentStore(s => s.socialFeed)
  const socialVisibility = useConsentStore(s => s.socialVisibility)
  const pushNotifications = useConsentStore(s => s.pushNotifications)
  const marketing = useConsentStore(s => s.marketing)
  const analytics = useConsentStore(s => s.analytics)
  const surveys = useConsentStore(s => s.surveys)
  const consentVersion = useConsentStore(s => s.consentVersion)
  const consentGiven = useConsentStore(s => s.consentGiven)
  const revokedAt = useConsentStore(s => s.revokedAt)

  // Ações do store — referências estáveis do Zustand
  const hydrate = useConsentStore(s => s.hydrate)
  const markPending = useConsentStore(s => s.markPending)
  const setMany = useConsentStore(s => s.setMany)
  const markSynced = useConsentStore(s => s.markSynced)
  const markUnsynced = useConsentStore(s => s.markUnsynced)
  const revoke = useConsentStore(s => s.revoke)

  // Carrega consentimento do backend na primeira vez (status 'unknown' após boot)
  useEffect(() => {
    if (!isAuth || consentStatus !== 'unknown') return

    consentService
      .get()
      .then(record => {
        hydrate({
          locationPrecise: record.locationPrecise,
          socialFeed: record.socialFeed,
          socialVisibility: record.socialVisibility,
          pushNotifications: record.pushNotifications,
          marketing: record.marketing,
          analytics: record.analytics,
          surveys: record.surveys,
          consentGiven: true,
          consentVersion: record.consentVersion,
          revokedAt: record.revokedAt,
        })
      })
      .catch(() => {
        // 404 = usuário novo, nunca deu consentimento → aguarda tela de consent
        markPending()
      })
  }, [isAuth, consentStatus, hydrate, markPending])

  // Sync automático com debounce — lê estado atual do store via getState()
  // para evitar closure stale mesmo que o effect rode antes da última atualização
  useEffect(() => {
    if (!isAuth || isSynced) return

    const t = setTimeout(async () => {
      const s = useConsentStore.getState()
      try {
        await consentService.update({
          locationPrecise: s.locationPrecise,
          socialFeed: s.socialFeed,
          socialVisibility: s.socialVisibility,
          pushNotifications: s.pushNotifications,
          marketing: s.marketing,
          analytics: s.analytics,
          surveys: s.surveys,
        })
        useConsentStore.getState().markSynced()
      } catch {
        // Mantém isSynced = false → retry no próximo ciclo
      }
    }, 1500)

    return () => clearTimeout(t)
  }, [isAuth, isSynced])

  // ── Ações públicas ───────────────────────────────────────────

  const grantConsent = useCallback(
    async (fields: ConsentFields) => {
      hydrate({
        ...fields,
        consentGiven: true,
        consentVersion: CONSENT_VERSION,
      })
      try {
        await consentService.create(fields)
        markSynced()
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 409) {
          try {
            await consentService.update(fields)
            markSynced()
            return
          } catch {
            // fall through to markUnsynced
          }
        }
        // isSynced = false → retry automático via debounce
        markUnsynced()
      }
    },
    [hydrate, markSynced, markUnsynced],
  )

  const updateConsent = useCallback(
    async (fields: Partial<ConsentFields>) => {
      setMany(fields)
      try {
        await consentService.update(fields)
        markSynced()
      } catch {
        // Retry automático
      }
    },
    [setMany, markSynced],
  )

  const revokeAll = useCallback(async () => {
    revoke()
    try {
      await consentService.revokeAll()
      markSynced()
    } catch {
      // Retry automático
    }
  }, [revoke, markSynced])

  const exportData = useCallback(async () => {
    return consentService.export()
  }, [])

  const auditLog = useCallback(async () => {
    return consentService.auditLog()
  }, [])

  return {
    consent: {
      locationPrecise,
      socialFeed,
      socialVisibility,
      pushNotifications,
      marketing,
      analytics,
      surveys,
      consentVersion,
      consentGiven,
      status: consentStatus,
      revokedAt,
    },
    isSynced,
    needsVersionBump,
    grantConsent,
    updateConsent,
    revokeAll,
    exportData,
    auditLog,
  }
}
