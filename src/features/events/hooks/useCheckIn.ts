// Padrão otimista canônico — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { eventKeys, invalidateEventViews } from './cacheKeys'
import type { EventDetail } from '@/shared/types'

// O patch otimista é só da contagem, que vive no detalhe — feed e mapa não a
// exibem. Mas o backend também grava presença CONFIRMED no mesmo check-in, e
// ESSA o feed e o mapa exibem: por isso a invalidação é a das views de evento,
// não só a do detalhe. 'none' porque o card não mudou aqui e refetch ativo só
// reordenaria o feed embaixo de quem está na tela do evento.
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
    onSettled: () => invalidateEventViews(queryClient, eventId, 'none'),
  })
}
