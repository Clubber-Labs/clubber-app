import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import { reportKeys } from './cacheKeys'

// Detalhe de uma denúncia (GET /reports/:id) para a tela admin de moderação.
export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsService.getById(id),
    enabled: !!id,
    staleTime: 0,
  })
}
