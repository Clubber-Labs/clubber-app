import type { FeedAuthor } from '@/shared/types'

export type SpotVisibility = 'PUBLIC' | 'FRIENDS'

// Resposta padrão de /spots. `categories` usa os values do enum EventCategory
// (mesma fonte de rótulos do useCategories). `conversationId` é o grupo de chat
// criado junto com o spot — "ser membro = participar do chat".
export type Spot = {
  id: string
  title: string
  description: string | null
  categories: string[]
  // Chaves de 2º nível (subcategorias/gêneros). Aditivo — imutável após criar.
  subcategories?: string[]
  visibility: SpotVisibility
  placeId: string
  latitude: number
  longitude: number
  startsAt: string
  endsAt: string
  canceledAt: string | null
  createdAt: string
  conversationId: string
  creator: FeedAuthor
  memberCount: number
}

// Corpo do POST /spots/suggestions. `radiusKm` sobrescreve o raio salvo
// (spotRadiusKm) só nesta geração; `query` (texto livre da intenção) só quando o
// usuário descreve algo — e aí o backend ignora as preferências de rolê.
export type SpotSuggestionsParams = {
  latitude: number
  longitude: number
  // Inteiro, min 2, ≤ teto do backend. Override por geração.
  radiusKm?: number
  query?: string
}

// Candidato gerado pela IA (POST /spots/suggestions). Efêmero — não persiste
// no backend; a ordem do array já vem ranqueada e deve ser respeitada.
export type SpotSuggestion = {
  placeId: string
  name: string
  latitude: number
  longitude: number
  category: string
  address: string | null
  // Sinais do lugar — opcionais: o backend pode omitir (não só mandar null),
  // inclusive durante o rollout. O card só exibe os que vierem como número/bool.
  rating?: number | null
  userRatingCount?: number | null
  priceLevel?: string | null
  openNow?: boolean | null
  // Distância até o usuário. Com alcance "Capital inteira" pode chegar a ~40km.
  // Opcional pela mesma razão — guardado antes de formatar.
  distanceMeters?: number
  suggestedTitle: string
  suggestedDescription: string | null
}

export type SpotSuggestionsResponse = {
  suggestions: SpotSuggestion[]
  // Gerações restantes hoje (quota diária: free=5, premium=25). Conta mesmo em
  // cache hit no backend.
  remaining: number
}

// Filtros aplicados na listagem por bbox — espelha o subconjunto dos filtros
// do mapa que o GET /spots aceita.
export type SpotListFilters = {
  category?: string[]
  friendsOnly?: boolean
}
