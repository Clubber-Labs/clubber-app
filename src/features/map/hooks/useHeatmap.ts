import { useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { mapService, type Bbox, type HeatmapParams } from '../services/mapService'
import { normalizeFilters } from '@/shared/utils/normalizeFilters'

type Filters = Omit<HeatmapParams, keyof Bbox>

// Debounce do bbox fica no caller (map screen) pra não floodar o backend
// ao arrastar — quando ele estabilizar o bbox, a queryKey muda e o fetch
// dispara. keepPreviousData evita flicker enquanto refetcha.
export function useHeatmap(
  bbox: Bbox | null,
  filters: Filters,
  enabled: boolean,
) {
  // Normaliza pra que {category: undefined} e {} compartilhem cache
  const normalized = useMemo(() => normalizeFilters(filters), [filters])

  return useQuery({
    queryKey: ['heatmap', bbox, normalized],
    queryFn: () => mapService.getHeatmap({ ...bbox!, ...normalized }),
    enabled: enabled && !!bbox,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}
