import type { Bbox } from '@/features/map/services/mapService'
import type { MapFilterParams } from '@/features/map/types'

const VIEWPORT = ['spots', 'viewport'] as const
const NEARBY = ['spots', 'nearby'] as const

export const spotKeys = {
  all: ['spots'] as const,
  viewport: (bbox: Bbox | null, filters: MapFilterParams) =>
    [...VIEWPORT, bbox, filters] as const,
  // Prefixo de TODAS as variações de viewport — pra invalidar/editar em massa.
  viewportAll: VIEWPORT,
  // Coords do usuário [lng, lat]. Uma posição por sessão (o useUserLocation não
  // observa o GPS continuamente), então isso não vira enxurrada de refetch.
  nearby: (coords: [number, number] | null) => [...NEARBY, coords] as const,
  nearbyAll: NEARBY,
  // Prefixos das duas listagens de spot (mapa e feed): o que altera um rolê
  // precisa alcançar as duas, senão o balão some do mapa e fica no feed.
  listAll: [VIEWPORT, NEARBY] as const,
  detail: (id: string) => ['spots', 'detail', id] as const,
}
