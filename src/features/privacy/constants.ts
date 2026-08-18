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

/** Consentimento de verdade: opt-in, desligado por padrão. */
export const COMMUNICATION_ITEMS: {
  key: 'marketing' | 'surveys'
  label: string
  description: string
}[] = [
  {
    key: 'marketing',
    label: 'Novidades e promoções',
    description: 'Lançamentos, promoções e ofertas do plano Premium.',
  },
  {
    key: 'surveys',
    label: 'Convites para pesquisas',
    description: 'Convites voluntários para pesquisas de satisfação.',
  },
]

export type ProductPreferences = {
  socialFeed: boolean
  socialVisibility: boolean
  analytics: boolean
}

/** Bloco 3 — preferências de produto: ligadas por padrão, opt-out. */
export const PRODUCT_PREFERENCE_ITEMS: {
  key: keyof ProductPreferences
  label: string
  description: string
}[] = [
  {
    key: 'socialFeed',
    label: 'Feed personalizado',
    description:
      'Mostra no seu feed rolês que seus amigos curtiram, confirmaram ou criaram.',
  },
  {
    key: 'socialVisibility',
    label: 'Visibilidade das suas atividades',
    description:
      'Suas confirmações e comentários podem aparecer no feed de outras pessoas.',
  },
  {
    key: 'analytics',
    label: 'Métricas de uso',
    description:
      'Dados de como o app é usado, para melhorarmos o que não está funcionando.',
  },
]
