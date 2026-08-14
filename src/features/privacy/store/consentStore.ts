import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ConsentFields, ConsentRecord } from '../services/consentService'
import { DEFAULT_CONSENT_FIELDS } from '../constants'

/**
 * Espelho local do registro de consentimento. NÃO é portão de entrada: o app
 * abre independentemente do que estiver aqui. Serve pra dois usos —
 * gatear coleta (localização/push) e mostrar estado na tela de privacidade.
 *
 * locationPrecise e pushNotifications refletem a permissão do SISTEMA, não uma
 * escolha em tela; quem os mantém em dia é o useConsentMirror.
 */
type ConsentState = ConsentFields & {
  consentVersion: string | null
  /** null = consentimento vigente. Preenchido = revogado no Art. 18. */
  revokedAt: string | null
  /** true depois que o AsyncStorage foi lido. */
  hydrated: boolean
}

type ConsentActions = {
  hydrate: (record: ConsentRecord) => void
  setMany: (fields: Partial<ConsentFields>) => void
  setHydrated: () => void
  reset: () => void
}

const initialState: ConsentState = {
  ...DEFAULT_CONSENT_FIELDS,
  consentVersion: null,
  revokedAt: null,
  hydrated: false,
}

export const useConsentStore = create<ConsentState & ConsentActions>()(
  persist(
    set => ({
      ...initialState,

      hydrate(record) {
        set({
          locationPrecise: record.locationPrecise,
          pushNotifications: record.pushNotifications,
          marketing: record.marketing,
          surveys: record.surveys,
          consentVersion: record.consentVersion,
          revokedAt: record.revokedAt,
          hydrated: true,
        })
      },

      setMany(fields) {
        set(fields)
      },

      setHydrated() {
        set({ hydrated: true })
      },

      // Logout/troca de conta. Preserva `hydrated`: ele diz "o AsyncStorage já
      // foi lido", um latch de sessão — e o onRehydrateStorage só roda no boot.
      reset() {
        set(s => ({ ...initialState, hydrated: s.hydrated }))
      },
    }),
    {
      name: 'clubber-consent-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...state }) => state,
      onRehydrateStorage: () => state => {
        state?.setHydrated()
      },
    },
  ),
)

// ── Seletores ────────────────────────────────────────────────
/**
 * Pode coletar/enviar localização? Precisa da permissão do SO (espelhada aqui)
 * E de consentimento vigente: uma revogação do Art. 18 não é desfeita porque o
 * usuário reativou a permissão nos Ajustes do sistema.
 */
export const selectCanUseLocation = (s: ConsentState) =>
  s.locationPrecise && !s.revokedAt
export const selectCanSendPush = (s: ConsentState) =>
  s.pushNotifications && !s.revokedAt
export const selectConsentRevoked = (s: ConsentState) => !!s.revokedAt
export const selectConsentVersion = (s: ConsentState) => s.consentVersion
export const selectConsentHydrated = (s: ConsentState) => s.hydrated
