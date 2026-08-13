import type { FeedEvent } from '@/shared/types'
import { categoryHue } from '@/shared/theme'
import { eventCategoryEmoji } from '@/shared/utils/eventCategoryEmoji'

// A gota só lê categoria e estado do evento: tipar pelo mínimo deixa o detalhe
// (EventDetail) e o preview do formulário (só categorias escolhidas) reusarem
// o mesmo pin do mapa.
export type EventPinSource = Pick<
  FeedEvent,
  'categories' | 'isFeatured' | 'status'
>

export type EventPinLook = {
  emoji: string
  field: string
  live: boolean
  featured: boolean
  faded: boolean
}

// Traduz o evento nos estados visuais da gota — uma fonte só, pra mapa e
// mini-mapa não divergirem quando a regra mudar.
export function eventPinLook(event: EventPinSource): EventPinLook {
  return {
    emoji: eventCategoryEmoji(event.categories),
    field: categoryHue(event.categories[0]).pinField,
    live: event.status === 'ONGOING',
    featured: !!event.isFeatured,
    faded: event.status === 'PAST',
  }
}
