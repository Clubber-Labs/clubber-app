import { api } from '@/shared/lib/api'
import type { FeedEvent } from '@/shared/types'
import type { MapFilterParams } from '../types'

export type Bbox = {
  bboxNorth: number
  bboxSouth: number
  bboxEast: number
  bboxWest: number
}

export type HeatmapPoint = {
  id: string
  latitude: number
  longitude: number
  weight: number
}

// Eventos completos por viewport — o backend cappeia e devolve `truncated`.
export type ViewportResponse = {
  data: FeedEvent[]
  truncated: boolean
}

type HeatmapParams = Bbox & MapFilterParams
type ViewportParams = Bbox & MapFilterParams & { limit?: number }

function mapFilterQuery({ category, status, friendsOnly }: MapFilterParams) {
  return {
    ...(category?.length ? { category } : {}),
    ...(status?.length ? { status } : {}),
    ...(friendsOnly ? { friendsOnly: true } : {}),
  }
}

export const mapService = {
  getHeatmap: ({
    bboxNorth,
    bboxSouth,
    bboxEast,
    bboxWest,
    ...filters
  }: HeatmapParams): Promise<HeatmapPoint[]> =>
    api
      .get('/events/map', {
        params: {
          bboxNorth,
          bboxSouth,
          bboxEast,
          bboxWest,
          ...mapFilterQuery(filters),
        },
        // Backend espera array repetido (status=A&status=B), não brackets.
        paramsSerializer: { indexes: null },
      })
      .then(r => r.data),

  getViewportEvents: ({
    bboxNorth,
    bboxSouth,
    bboxEast,
    bboxWest,
    limit,
    ...filters
  }: ViewportParams): Promise<ViewportResponse> =>
    api
      .get('/events/map/events', {
        params: {
          bboxNorth,
          bboxSouth,
          bboxEast,
          bboxWest,
          ...mapFilterQuery(filters),
          ...(limit ? { limit } : {}),
        },
        paramsSerializer: { indexes: null },
      })
      .then(r => r.data),
}
