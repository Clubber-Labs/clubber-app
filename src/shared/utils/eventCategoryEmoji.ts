// Values do enum EventCategory do backend (MAIÚSCULAS, estáveis) → emoji do
// próprio sistema. O fallback cobre OTHER, categorias novas ainda não
// mapeadas e eventos sem categoria.
const CATEGORY_EMOJIS: Record<string, string> = {
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

const FALLBACK_CATEGORY_EMOJI = '📅'

export function eventCategoryEmoji(categories: string[]): string {
  const primary = categories[0]
  return (primary && CATEGORY_EMOJIS[primary]) || FALLBACK_CATEGORY_EMOJI
}
