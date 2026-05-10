import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { mapService, type Bbox, type HeatmapParams } from '../services/mapService'

type Filters = Omit<HeatmapParams, keyof Bbox>

// Debounce do bbox fica no caller (map screen) pra não floodar o backend
// ao arrastar — quando ele estabilizar o bbox, a queryKey muda e o fetch
// dispara. keepPreviousData evita flicker enquanto refetcha.
export function useHeatmap(
  bbox: Bbox | null,
  filters: Filters,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['heatmap', bbox, filters],
    queryFn: () => mapService.getHeatmap({ ...bbox!, ...filters }),
    enabled: enabled && !!bbox,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}
