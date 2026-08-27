import type { ConsentFields } from './services/consentService'

export const DEFAULT_CONSENT_FIELDS: ConsentFields = {
  locationPrecise: false,
  pushNotifications: false,
  marketing: false,
  surveys: false,
}

/**
 * A tela de privacidade separa os controles por natureza — misturar tudo numa
 * lista de switches iguais é o erro que faz o usuário arrastar um toggle que o
 * app não consegue honrar. As permissões do dispositivo não têm lista aqui: o
 * rótulo delas vive na tela, junto do estado lido do SO (DevicePermissionRow).
 */

/**
 * Consentimento de verdade: opt-in, desligado por padrão. Guarda a CHAVE do
 * dicionário — frase pronta avaliaria no import e congelaria o idioma no boot.
 */
export const COMMUNICATION_ITEMS = [
  {
    key: 'marketing',
    labelKey: 'privacy.items.marketing.label',
    descriptionKey: 'privacy.items.marketing.description',
  },
  {
    key: 'surveys',
    labelKey: 'privacy.items.surveys.label',
    descriptionKey: 'privacy.items.surveys.description',
  },
] as const satisfies readonly {
  key: 'marketing' | 'surveys'
  labelKey: string
  descriptionKey: string
}[]

export type ProductPreferences = {
  socialFeed: boolean
  socialVisibility: boolean
  analytics: boolean
  // Fora do PRODUCT_PREFERENCE_ITEMS de propósito: o toggle mora na tela do
  // Spotify, ao lado do vínculo que o torna relevante. Aqui, entre switches de
  // quem nem vinculou a conta, seria ruído.
  spotifyArtistsVisible: boolean
  spotifyTopArtistVisible: boolean
}

/** Bloco 3 — preferências de produto: ligadas por padrão, opt-out. */
export const PRODUCT_PREFERENCE_ITEMS = [
  {
    key: 'socialFeed',
    labelKey: 'privacy.items.socialFeed.label',
    descriptionKey: 'privacy.items.socialFeed.description',
  },
  {
    key: 'socialVisibility',
    labelKey: 'privacy.items.socialVisibility.label',
    descriptionKey: 'privacy.items.socialVisibility.description',
  },
  {
    key: 'analytics',
    labelKey: 'privacy.items.analytics.label',
    descriptionKey: 'privacy.items.analytics.description',
  },
] as const satisfies readonly {
  key: keyof ProductPreferences
  labelKey: string
  descriptionKey: string
}[]
