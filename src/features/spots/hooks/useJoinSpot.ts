import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationPriming } from '@/features/notifications/hooks/useNotificationPriming'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'

// Entrar no grupo do spot. Idempotente no backend (200 se já é membro) —
// o caller navega pro chat com o conversationId devolvido.
export function useJoinSpot(id: string) {
  const queryClient = useQueryClient()
  const { primeAfterSocialAction } = useNotificationPriming()

  return useMutation({
    mutationFn: () => spotsService.join(id),
    onSuccess: () => {
      // memberCount mudou — sincroniza detail, balões do mapa e cards do feed.
      queryClient.invalidateQueries({ queryKey: spotKeys.detail(id) })
      for (const key of spotKeys.listAll) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      void primeAfterSocialAction()
    },
  })
}
