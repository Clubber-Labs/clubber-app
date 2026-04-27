import { useQuery } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export function useMe() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  return useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}
