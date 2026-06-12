import { useQuery } from '@tanstack/react-query'
import { isNotFoundError } from '@/shared/lib/apiError'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'

export function useSpot(id: string) {
  return useQuery({
    queryKey: spotKeys.detail(id),
    queryFn: () => spotsService.getById(id),
    enabled: !!id,
    // 404 cobre inexistente, privado pra não-amigo E bloqueio — o backend não
    // distingue de propósito (não revelar existência). Retry seria inútil.
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 1,
  })
}
