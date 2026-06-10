import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import { reportKeys } from './cacheKeys'
import type { Report, ReportStatus } from '../types'

// Muda o status da denúncia (REVIEWED/RESOLVED/DISMISSED). Atualiza o cache do
// detalhe com a resposta e invalida as listas (todas as variações de filtro).
export function useUpdateReport(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: ReportStatus) =>
      reportsService.updateStatus(id, status),
    onSuccess: updated => {
      queryClient.setQueryData<Report>(reportKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}
