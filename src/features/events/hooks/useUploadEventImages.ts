import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { invalidateEventViews } from './cacheKeys'
import { getApiError } from '@/shared/lib/apiError'
import { useBanner } from '@/shared/lib/banner'
import { settleAll } from '@/shared/utils/settleAll'

type Args = { eventId: string; uris: string[] }

/**
 * Sobe as fotos escolhidas no cadastro, contra o evento já criado. O evento não
 * se perde se uma imagem falhar — mas a falha aparece: sem isso o evento nasce
 * sem capa e ninguém fica sabendo por quê.
 */
export function useUploadEventImages() {
  const queryClient = useQueryClient()
  const showBanner = useBanner()

  return useMutation({
    mutationFn: ({ eventId, uris }: Args) =>
      settleAll(uris.map(uri => eventsService.uploadEventImage(eventId, uri))),
    onError: error => showBanner(getApiError(error).message),
    onSettled: (_data, _err, vars) => {
      invalidateEventViews(queryClient, vars.eventId)
    },
  })
}
