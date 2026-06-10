import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import { reportKeys } from './cacheKeys'

// Exclui a denúncia (DELETE /reports/:id). Invalida as listas; a navegação de
// volta fica a cargo da tela de detalhe.
export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}
