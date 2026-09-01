import { categoryEmoji } from './eventCategoryEmoji'

// Gêneros (GENRE_*) do backend → emoji. Subcategoria de venue herda o emoji da
// categoria-mãe, resolvida por quem chama (a árvore vem de /categories; o
// prefixo da chave não é confiável: FILM_CINEMA pertence a FILM_THEATER).
const GENRE_EMOJIS: Record<string, string> = {
  GENRE_SERTANEJO: '🤠',
  GENRE_FUNK: '🔊',
  GENRE_PAGODE_SAMBA: '🪘',
  GENRE_ROCK: '🎸',
  GENRE_POP: '🎤',
  GENRE_RAP: '🎙️',
  GENRE_FORRO: '🪗',
  GENRE_PISEIRO: '🪗',
  GENRE_AXE: '🥁',
  GENRE_INDIE: '🎧',
  GENRE_HOUSE: '🎛️',
  GENRE_TECH_HOUSE: '🎛️',
  GENRE_TECHNO: '🎛️',
  GENRE_PSYTRANCE: '🌀',
  GENRE_DNB: '⚡',
  GENRE_EDM: '🎆',
}

const FALLBACK_GENRE_EMOJI = '🎶'

export function interestEmoji(value: string, parentCategory?: string): string {
  if (value.startsWith('GENRE_')) {
    return GENRE_EMOJIS[value] ?? FALLBACK_GENRE_EMOJI
  }
  return categoryEmoji(parentCategory ?? value)
}
