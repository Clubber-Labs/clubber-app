// Formatadores puros dos sinais de um lugar sugerido. A distância reaproveita
// formatDistance (shared/utils/distance) convertendo metros → km no card.

// Nota de avaliação (0..5) com o separador decimal do locale: 4.5 → "4,5" em
// pt/es, "4.5" em en.
export function formatRating(rating: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating)
}

// Enum de faixa de preço (Google Places) → cifrões. Níveis sem preço útil
// (grátis/indefinido/desconhecido) viram null e somem do card.
const PRICE_LEVEL_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

export function priceLevelSymbol(
  priceLevel: string | null | undefined,
): string | null {
  if (!priceLevel) return null
  return PRICE_LEVEL_SYMBOLS[priceLevel] ?? null
}
