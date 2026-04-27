import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { geocodingService } from '../services/geocodingService'

export function useAddressSearch(query: string) {
  const debounced = useDebounce(query, 350)

  return useQuery({
    queryKey: ['geocoding', debounced],
    queryFn: () => geocodingService.search(debounced),
    enabled: debounced.trim().length >= 3,
    staleTime: 1000 * 60 * 5,
  })
}
