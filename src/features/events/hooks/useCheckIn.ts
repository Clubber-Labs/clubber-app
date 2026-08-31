// Padrão otimista canônico — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { eventKeys } from './cacheKeys'
import type { EventDetail } from '@/shared/types'

// Check-in só existe no detalhe (é a tela do "estou aqui"): feed e mapa não
// exibem a contagem, então nada além do cache do evento precisa de patch.
export function useCheckIn(eventId: string) {
  const queryClient = useQueryClient()
  const detailKey = eventKeys.detail(eventId)

  return useMutation({
    mutationFn: () => eventsService.checkIn(eventId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey })
      const prev = queryClient.getQueryData<EventDetail>(detailKey)
      queryClient.setQueryData<EventDetail>(detailKey, old =>
        old?.checkIns && !old.checkIns.viewerCheckedIn
          ? {
              ...old,
              checkIns: {
                ...old.checkIns,
                count: old.checkIns.count + 1,
                viewerCheckedIn: true,
              },
            }
          : old,
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(detailKey, ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: detailKey }),
  })
}
