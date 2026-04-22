import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/lib/api'

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () => api.get('/feed').then(r => r.data),
  })
}
