import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { eventKeys, invalidateEventViews } from './cacheKeys'
import {
  toUpdateEventPayload,
  type CreateEventInput,
} from '../schemas/createEventSchema'
import type { EventDetail } from '@/shared/types'

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()
  const detailKey = eventKeys.detail(id)

  return useMutation({
    mutationFn: (data: CreateEventInput) =>
      eventsService.update(id, toUpdateEventPayload(data)),
    onMutate: async data => {
      // Optimistic na detail pra refletir edição na tela ao voltar.
      // Padrão canônico: ver CLAUDE.md → "Tratamento de erros e feedback".
      // `address` fica de fora: o PUT não atualiza endereço, então não
      // mostramos uma mudança que o backend vai descartar.
      await queryClient.cancelQueries({ queryKey: detailKey })
      const prev = queryClient.getQueryData<EventDetail>(detailKey)
      if (prev) {
        queryClient.setQueryData<EventDetail>(detailKey, {
          ...prev,
          title: data.title,
          description: data.description?.trim() ?? '',
          date: data.date.toISOString(),
          endDate: data.endDate ? data.endDate.toISOString() : null,
          latitude: data.latitude,
          longitude: data.longitude,
          categories: data.categories,
          isPublic: data.isPublic,
        })
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(detailKey, ctx.prev)
    },
    onSettled: () => invalidateEventViews(queryClient, id),
  })
}
