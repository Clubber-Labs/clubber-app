import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ConsentFields } from '../services/consentService'
import { DEFAULT_CONSENT_FIELDS } from '../constants'

export type ConsentStatus = 'unknown' | 'pending' | 'given' | 'revoked'

type ConsentState = ConsentFields & {
  consentGiven: boolean
  consentVersion: string | null
  status: ConsentStatus
  isSynced: boolean
  revokedAt: string | null
  /** true após o zustand terminar de ler o AsyncStorage — evita redirect prematuro */
  hydrated: boolean
}

type ConsentActions = {
  hydrate: (
    data: Partial<ConsentState> & {
      consentGiven?: boolean
      consentVersion?: string | null
    },
  ) => void
  setField: (field: keyof ConsentFields, value: boolean) => void
  setMany: (fields: Partial<ConsentFields>) => void
  acceptAll: () => void
  acceptEssentialOnly: () => void
  revoke: () => void
  markSynced: () => void
  markUnsynced: () => void
  markPending: () => void
  setHydrated: () => void
  reset: () => void
}

const initialState: ConsentState = {
  ...DEFAULT_CONSENT_FIELDS,
  consentGiven: false,
  consentVersion: null,
  status: 'unknown',
  isSynced: false,
  revokedAt: null,
  hydrated: false,
}

export const useConsentStore = create<ConsentState & ConsentActions>()(
  persist(
    set => ({
      ...initialState,

      hydrate(data) {
        set({
          ...data,
          consentGiven: data.consentGiven ?? true,
          status: data.consentGiven === false ? 'pending' : 'given',
          isSynced: true,
          hydrated: true,
        })
      },

      setField(field, value) {
        set(s => ({ ...s, [field]: value, isSynced: false }))
      },

      setMany(fields) {
        set(s => ({ ...s, ...fields, isSynced: false }))
      },

      acceptAll() {
        const all = Object.fromEntries(
          Object.keys(DEFAULT_CONSENT_FIELDS).map(k => [k, true]),
        ) as ConsentFields
        set({ ...all, consentGiven: true, status: 'given', isSynced: false })
      },

      acceptEssentialOnly() {
        set({
          ...DEFAULT_CONSENT_FIELDS,
          consentGiven: true,
          status: 'given',
          isSynced: false,
        })
      },

      revoke() {
        set({
          ...DEFAULT_CONSENT_FIELDS,
          consentGiven: true,
          status: 'revoked',
          revokedAt: new Date().toISOString(),
          isSynced: false,
        })
      },

      markSynced() {
        set({ isSynced: true })
      },
      markUnsynced() {
        set({ isSynced: false })
      },
      markPending() {
        set({ status: 'pending' })
      },
      setHydrated() {
        set({ hydrated: true })
      },
      // Limpa os dados de consentimento (logout/troca de usuário) MAS preserva
      // `hydrated`: ele indica "o AsyncStorage já foi lido" — um latch de sessão,
      // não um dado de consentimento. Zerá-lo deixaria onConsentFlow=true (header
      // some) até reiniciar o app, pois onRehydrateStorage só roda no boot.
      reset() {
        set(s => ({ ...initialState, hydrated: s.hydrated }))
      },
    }),
    {
      name: 'connectai-consent-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ isSynced: _s, hydrated: _h, ...state }) => state,
      onRehydrateStorage: () => state => {
        state?.setHydrated()
      },
    },
  ),
)

// ── Seletores ────────────────────────────────────────────────
export const selectConsentGiven = (s: ConsentState) => s.consentGiven
/** Só redireciona para consent quando já hidratado E realmente precisa de consentimento */
export const selectNeedsConsent = (s: ConsentState) =>
  s.hydrated && (!s.consentGiven || s.status === 'pending')
export const selectNeedsVersionBump = (
  s: ConsentState,
  currentVersion: string,
) =>
  s.hydrated &&
  s.consentGiven &&
  s.consentVersion !== null &&
  s.consentVersion !== currentVersion
export const selectConsentHydrated = (s: ConsentState) => s.hydrated
export const selectCanUseLocation = (s: ConsentState) => s.locationPrecise
export const selectCanUseSocialFeed = (s: ConsentState) => s.socialFeed
export const selectCanSendPush = (s: ConsentState) => s.pushNotifications
