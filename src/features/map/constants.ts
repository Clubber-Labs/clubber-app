import { colors } from '@/shared/theme'
export const MAP_STYLE_URL =
  'mapbox://styles/bonatoneto/cmoz3l4fa003601qrd130bk09'
export const BRAZIL_CENTER: [number, number] = [-47.9292, -15.7801]
export const BRAZIL_ZOOM = 4
export const USER_ZOOM = 13
export const MIN_ZOOM = 2
export const MAX_ZOOM = 20
export const ZOOM_STEP = 1
export const MARKERS_ZOOM_THRESHOLD = 14
export const CLUSTER_MAX_ZOOM = 14
export const CLUSTER_RADIUS = 50
export const ALL_CATEGORIES = 'Todas'
export const VIOLET_500 = colors.brandEmphasis
export const VIOLET_600 = colors.brand
export const VIOLET_400 = colors.brandText
// Azul padrão do "blue dot" de localização (iOS system blue) — cor de plataforma,
// não um token do design system.
// eslint-disable-next-line no-restricted-syntax
export const LOCATION_BLUE = '#007AFF'

// Debounce da captura de bbox ao arrastar o mapa (carga por viewport).
export const BBOX_DEBOUNCE_MS = 300
// Teto de eventos carregados por viewport. Alinhado ao cap do backend
// (GET /events/map/events aceita limit <= 150); acima disso o backend retorna 400.
export const VIEWPORT_LIMIT = 150
