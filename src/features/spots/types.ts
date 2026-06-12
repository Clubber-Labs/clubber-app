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

// Candidato gerado pela IA (POST /spots/suggestions). Efêmero — não persiste
// no backend; a ordem do array já vem ranqueada e deve ser respeitada.
export type SpotSuggestion = {
  placeId: string
  name: string
  latitude: number
  longitude: number
  category: string
  address: string | null
  suggestedTitle: string
  suggestedDescription: string | null
}

export type SpotSuggestionsResponse = {
  suggestions: SpotSuggestion[]
  // Gerações restantes hoje (quota diária: free=5, premium=25).
  remaining: number
}

// Filtros aplicados na listagem por bbox — espelha o subconjunto dos filtros
// do mapa que o GET /spots aceita.
export type SpotListFilters = {
  category?: string[]
  friendsOnly?: boolean
}
