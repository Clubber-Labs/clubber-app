import { api } from '@/shared/lib/api'

export type ConsentFields = {
  locationPrecise: boolean
  socialFeed: boolean
  socialVisibility: boolean
  pushNotifications: boolean
  marketing: boolean
  analytics: boolean
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

export const CONSENT_VERSION = '1.0'

export const CONSENT_ITEMS: Array<{
  key: keyof ConsentFields
  label: string
  description: string
  category:
    | 'location'
    | 'social'
    | 'notifications'
    | 'analytics'
    | 'marketing'
    | 'research'
}> = [
  {
    key: 'locationPrecise',
    label: 'Localização precisa (GPS)',
    description:
      'Usamos sua posição em tempo real para exibir eventos próximos no mapa e no mapa de calor.',
    category: 'location',
  },
  {
    key: 'socialFeed',
    label: 'Feed social personalizado',
    description:
      'Mostramos no seu feed eventos que amigos curtiram, confirmaram ou criaram.',
    category: 'social',
  },
  {
    key: 'socialVisibility',
    label: 'Visibilidade de atividades',
    description:
      'Suas confirmações e comentários podem aparecer no feed de outros usuários.',
    category: 'social',
  },
  {
    key: 'pushNotifications',
    label: 'Notificações push',
    description:
      'Alertas sobre novos eventos próximos, convites e atividade da sua rede.',
    category: 'notifications',
  },
  {
    key: 'marketing',
    label: 'Comunicações de marketing',
    description:
      'Novidades da plataforma, promoções e ofertas do plano Premium.',
    category: 'marketing',
  },
  {
    key: 'analytics',
    label: 'Analytics e métricas de uso',
    description:
      'Dados anônimos de como você usa o app para melhorarmos a plataforma.',
    category: 'analytics',
  },
  {
    key: 'surveys',
    label: 'Participação em pesquisas',
    description:
      'Convites voluntários para pesquisas de satisfação e melhoria do produto.',
    category: 'research',
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  location: '📍 Localização',
  social: '👥 Rede Social',
  notifications: '🔔 Notificações',
  analytics: '📊 Analytics',
  marketing: '📣 Marketing',
  research: '🔬 Participação em pesquisas',
}

export const consentService = {
  get: (): Promise<ConsentRecord> => api.get('/consent').then(r => r.data),

  create: (data: ConsentFields): Promise<ConsentRecord> =>
    api.post('/consent', data).then(r => r.data),

  update: (data: Partial<ConsentFields>): Promise<ConsentRecord> =>
    api.patch('/consent', data).then(r => r.data),

  revokeAll: (): Promise<void> => api.delete('/consent').then(r => r.data),

  export: (): Promise<unknown> => api.get('/consent/export').then(r => r.data),

  auditLog: () => api.get('/consent/audit').then(r => r.data),
}
