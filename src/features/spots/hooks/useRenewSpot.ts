import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'

// Renovação consome quota diária (mesma do gerar; 429 ao estourar) — sem
// retry, e o caller desabilita o botão via isPending (lock anti double-tap).
export function useRenewSpot(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => spotsService.renew(id),
    retry: false,
    onSuccess: spot => {
      // O Spot volta com endsAt +24h — a janela na tela atualiza na hora.
      queryClient.setQueryData(spotKeys.detail(id), spot)
      queryClient.invalidateQueries({ queryKey: spotKeys.viewportAll })
    },
  })
}
