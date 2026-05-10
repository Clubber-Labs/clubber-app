import { api } from '@/shared/lib/api'
import type { EventStatus } from '@/shared/types'

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

export type HeatmapParams = Bbox & {
  category?: string[]
  status?: EventStatus[]
  dateFrom?: string
  dateTo?: string
}

export const mapService = {
  getHeatmap: ({
    bboxNorth,
    bboxSouth,
    bboxEast,
    bboxWest,
    category,
    status,
    dateFrom,
    dateTo,
  }: HeatmapParams): Promise<HeatmapPoint[]> =>
    api
      .get('/events/map', {
        params: {
          bboxNorth,
          bboxSouth,
          bboxEast,
          bboxWest,
          ...(category?.length ? { category } : {}),
          ...(status?.length ? { status } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        },
        // Backend espera array repetido (status=A&status=B), não brackets.
        paramsSerializer: { indexes: null },
      })
      .then(r => r.data),
}
