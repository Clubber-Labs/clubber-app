export const MAP_STYLE_URL = 'mapbox://styles/bonatoneto/cmoz3l4fa003601qrd130bk09'
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
export const VIOLET_500 = '#8b5cf6'
export const VIOLET_600 = '#7c3aed'
export const VIOLET_400 = '#a78bfa'
// Azul padrão do "blue dot" de localização (iOS system blue).
export const LOCATION_BLUE = '#007AFF'

// Debounce da captura de bbox ao arrastar o mapa (carga por viewport).
export const BBOX_DEBOUNCE_MS = 300
// Teto de eventos carregados por viewport (o backend também limita).
export const VIEWPORT_LIMIT = 200
