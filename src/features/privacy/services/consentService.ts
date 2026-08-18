import { api } from '@/shared/lib/api'

/**
 * O que o registro de consentimento guarda hoje. As preferências de produto
 * (socialFeed, socialVisibility, analytics) NÃO moram aqui — são campos do
 * perfil, editadas por PUT /users/:id. Mandá-las num PATCH daqui é erro 400.
 */
export type ConsentFields = {
  /** Espelho da permissão do SO — escrito pelo app quando ela muda. */
  locationPrecise: boolean
  /** Espelho da permissão do SO — idem. */
  pushNotifications: boolean
  /** Consentimento de verdade: opt-in explícito. */
  marketing: boolean
  /** Consentimento de verdade: opt-in explícito. */
  surveys: boolean
}

export type ConsentRecord = ConsentFields & {
  id: string
  userId: string
  essentialAccepted: boolean
  consentVersion: string
  collectedAt: string
  updatedAt: string
  revokedAt: string | null
}

export type ConsentExport = {
  exportedAt: string
  currentConsent: ConsentRecord
  preferences: {
    socialFeed: boolean
    socialVisibility: boolean
    analytics: boolean
  }
  termsAcceptances: {
    document: string
    version: string
    acceptedAt: string
  }[]
  history: unknown[]
}

/** Versão vigente dos documentos. Compare com o `consent.version` do perfil. */
export const CONSENT_VERSION = '1.0'

export const consentService = {
  // Sempre 200 pra usuário autenticado: 404 aqui é bug de backend, não fluxo.
  get: (): Promise<ConsentRecord> => api.get('/consent').then(r => r.data),

  // Body parcial — só o que mudou. Não existe POST: toda escrita é PATCH.
  update: (data: Partial<ConsentFields>): Promise<ConsentRecord> =>
    api.patch('/consent', data).then(r => r.data),

  // Art. 18: desliga os consentimentos E as preferências de produto do perfil,
  // e apaga a localização guardada. Quem chama precisa recarregar o perfil.
  revokeAll: (): Promise<{ message: string }> =>
    api.delete('/consent').then(r => r.data),

  // Operação pesada (5/min): só a partir de ação explícita, nunca em retry.
  export: (): Promise<ConsentExport> =>
    api.get('/consent/export').then(r => r.data),

  auditLog: (params?: { limit?: number; cursor?: string }) =>
    api.get('/consent/audit', { params }).then(r => r.data),
}
