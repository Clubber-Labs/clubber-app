import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'

// Entrar no grupo do spot. Idempotente no backend (200 se já é membro) —
// o caller navega pro chat com o conversationId devolvido.
export function useJoinSpot(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => spotsService.join(id),
    onSuccess: () => {
      // memberCount mudou — sincroniza detail e balões do mapa.
      queryClient.invalidateQueries({ queryKey: spotKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: spotKeys.viewportAll })
    },
  })
}
