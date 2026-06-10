import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import { reportKeys } from './cacheKeys'
import type { ReportStatus } from '../types'

// Lista de denúncias do painel admin. `status` undefined = todas.
export function useReports(status?: ReportStatus) {
  return useQuery({
    queryKey: reportKeys.list(status),
    queryFn: () => reportsService.list(status),
    // Fila de moderação muda com frequência — evita servir cache velho ao abrir.
    staleTime: 0,
  })
}
