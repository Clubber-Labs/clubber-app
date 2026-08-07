// Values do enum EventCategory do backend (MAIÚSCULAS, estáveis) → emoji do
// próprio sistema. O fallback cobre OTHER, categorias novas ainda não
// mapeadas e eventos sem categoria.
export const CATEGORY_EMOJIS: Record<string, string> = {
  MUSIC: '🎵',
  SPORTS: '🏀',
  TECH: '💻',
  GASTRONOMY: '🍽️',
  CAFE: '☕',
  ART: '🎨',
  EDUCATION: '🎓',
  NIGHTLIFE: '🍸',
  BUSINESS: '💼',
  HEALTH_WELLNESS: '💪',
  OUTDOORS: '🌳',
  GAMING: '🎮',
  FILM_THEATER: '🎬',
  COMEDY: '😂',
  FASHION: '👗',
  MARKETS: '🛍️',
  RELIGION: '🙏',
  FAMILY: '👪',
  PETS: '🐾',
  VOLUNTEERING: '🤝',
  PARTY: '🎉',
}

export const FALLBACK_CATEGORY_KEY = 'OTHER'
export const FALLBACK_CATEGORY_EMOJI = '📅'

export function eventCategoryEmoji(categories: string[]): string {
  const primary = categories[0]
  return (primary && CATEGORY_EMOJIS[primary]) || FALLBACK_CATEGORY_EMOJI
}

// Chave segura pra imagem de pin data-driven: categoria conhecida ou fallback.
export function eventCategoryKey(categories: string[]): string {
  const primary = categories[0]
  return primary && CATEGORY_EMOJIS[primary] ? primary : FALLBACK_CATEGORY_KEY
}
