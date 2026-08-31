import { colors } from './colors'

// Experimento "cor é informação": cada categoria de evento tem um matiz-base
// (chaves = enum EventCategory do backend, espelhando eventCategoryEmoji). A
// cor aparece porque significa algo — nenhuma vira cor de marca, porque são
// todas. Derivações (campo do pin, chip ativo) são calculadas do matiz-base.
const CATEGORY_BASE: Record<string, string> = {
  MUSIC: '#8b5cf6',
  SPORTS: '#22c55e',
  TECH: '#38bdf8',
  GASTRONOMY: '#f97316',
  CAFE: '#b45309',
  ART: '#06b6d4',
  EDUCATION: '#3b82f6',
  NIGHTLIFE: '#ec4899',
  BUSINESS: '#64748b',
  HEALTH_WELLNESS: '#10b981',
  OUTDOORS: '#84cc16',
  GAMING: '#6366f1',
  FILM_THEATER: '#e11d48',
  COMEDY: '#facc15',
  FASHION: '#d946ef',
  MARKETS: '#fb923c',
  RELIGION: '#a78bfa',
  FAMILY: '#f472b6',
  PETS: '#a16207',
  VOLUNTEERING: '#14b8a6',
  PARTY: '#f43f5e',
}

const DARK_ANCHOR = '#101014'
const LIGHT_ANCHOR = '#f4f4f7'

function channel(hex: string, i: number): number {
  return parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
}

// Mistura linear simples — suficiente pra derivar tons escuros/claros do
// matiz-base sem lib de cor.
function mix(a: string, b: string, t: number): string {
  const parts = [0, 1, 2].map(i =>
    Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t)
      .toString(16)
      .padStart(2, '0'),
  )
  return `#${parts.join('')}`
}

export type CategoryHue = {
  // Campo atrás do emoji na cabeça do pin (bem escuro, tingido do matiz).
  pinField: string
  // Chip ativo: fundo escuro tingido, borda no matiz, texto claro tingido.
  chipBg: string
  chipBorder: string
  chipText: string
  // Capa-gradiente de evento sem foto (escuro → matiz): 3 stops.
  cover: [string, string, string]
}

function derive(base: string): CategoryHue {
  return {
    pinField: mix(base, DARK_ANCHOR, 0.72),
    chipBg: mix(base, DARK_ANCHOR, 0.62),
    chipBorder: mix(base, DARK_ANCHOR, 0.2),
    chipText: mix(base, LIGHT_ANCHOR, 0.62),
    // Capa do card sem foto. Puxa MUITO mais pro escuro que o chip: aqui o
    // matiz cobre a área toda do pôster, e no mesmo tom do chip ele gritava e
    // roubava a leitura do título. É pra dizer a categoria de relance, não pra
    // ser o assunto.
    cover: [
      mix(base, DARK_ANCHOR, 0.94),
      mix(base, DARK_ANCHOR, 0.85),
      mix(base, DARK_ANCHOR, 0.68),
    ],
  }
}

const FALLBACK: CategoryHue = {
  pinField: colors.surfaceElevated,
  chipBg: colors.surface,
  chipBorder: colors.lineStrong,
  chipText: colors.contentTertiary,
  cover: [colors.surface, colors.surfaceElevated, colors.surfaceHigh],
}

const HUES: Record<string, CategoryHue> = Object.fromEntries(
  Object.entries(CATEGORY_BASE).map(([key, base]) => [key, derive(base)]),
)

export function categoryHue(category: string | undefined): CategoryHue {
  return (category && HUES[category]) || FALLBACK
}
