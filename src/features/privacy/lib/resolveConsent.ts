import { isNotFoundError } from '@/shared/lib/apiError'
import { consentService } from '../services/consentService'
import { useConsentStore } from '../store/consentStore'

// Resolve o consentimento contra o backend e deixa o store DECIDÍVEL ('given' ou
// 'pending'). Roda ANTES de `setUser` no login/boot: o gate do AuthGuard lê o
// status, e autenticar ainda em 'unknown' faz a tela de consentimento abrir e
// sumir enquanto o GET volta. Erro que não seja 404 preserva o estado atual —
// "não sei" nunca bloqueia o app.
export async function resolveConsent(): Promise<void> {
  const { hydrate, markPending } = useConsentStore.getState()
  try {
    const record = await consentService.get()
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
  } catch (err) {
    // 404 = nunca consentiu (conta nova, login social) → o gate abre a tela.
    if (isNotFoundError(err)) markPending()
  }
}

// Boot: o estado persistido já decide o gate na maioria das sessões; só vai à
// rede (atrasando a saída da splash) quando ele não permite decidir.
export async function resolveConsentIfUnknown(): Promise<void> {
  if (useConsentStore.getState().status !== 'unknown') return
  await resolveConsent()
}
