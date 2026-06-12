import type { Bbox } from '@/features/map/services/mapService'
import type { SpotListFilters } from '../types'

export const spotKeys = {
  all: ['spots'] as const,
  viewport: (bbox: Bbox | null, filters: SpotListFilters) =>
    ['spots', 'viewport', bbox, filters] as const,
  // Prefixo de TODAS as variações de viewport — pra invalidar/editar em massa.
  viewportAll: ['spots', 'viewport'] as const,
  detail: (id: string) => ['spots', 'detail', id] as const,
}
