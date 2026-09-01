import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { geocodingService } from '../services/geocodingService'

// ~110 m: o suficiente pro viés de proximidade sem a queryKey mudar a cada
// oscilação do GPS. O mesmo par arredondado vai na chave e na chamada.
function roundCoords(coords: [number, number]): [number, number] {
  return [Number(coords[0].toFixed(3)), Number(coords[1].toFixed(3))]
}

export function useAddressSearch(
  query: string,
  coords: [number, number] | null,
) {
  const debounced = useDebounce(query, 350)
  const proximity = coords ? roundCoords(coords) : null

  return useQuery({
    queryKey: ['geocoding', debounced, proximity],
    queryFn: () => geocodingService.search(debounced, proximity),
    enabled: debounced.trim().length >= 3,
    staleTime: 1000 * 60 * 5,
  })
}
