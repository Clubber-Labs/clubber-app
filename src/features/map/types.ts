import type { EventStatus } from '@/shared/types'

export type MapFilters = {
  categories: string[]
  statuses: EventStatus[]
  friendsOnly: boolean
}

// Default ao abrir o mapa: tudo menos cancelados (requisito de produto).
export const DEFAULT_MAP_STATUSES: EventStatus[] = [
  'ONGOING',
  'SOON',
  'UPCOMING',
  'PAST',
]

export const DEFAULT_MAP_FILTERS: MapFilters = {
  categories: [],
  statuses: DEFAULT_MAP_STATUSES,
  friendsOnly: false,
}

// Params que vão pra rede (viewport + heatmap). Poda vazios pra queryKey estável.
export type MapFilterParams = {
  status?: EventStatus[]
  category?: string[]
  friendsOnly?: boolean
}

export function toMapFilterParams(filters: MapFilters): MapFilterParams {
  return {
    status: filters.statuses.length ? filters.statuses : undefined,
    category: filters.categories.length ? filters.categories : undefined,
    friendsOnly: filters.friendsOnly || undefined,
  }
}

export function isDefaultMapFilters(f: MapFilters): boolean {
  return (
    f.categories.length === 0 &&
    !f.friendsOnly &&
    f.statuses.length === DEFAULT_MAP_STATUSES.length &&
    DEFAULT_MAP_STATUSES.every(s => f.statuses.includes(s))
  )
}
