import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { invalidateEventViews } from './cacheKeys'

type Args = { eventId: string; uris: string[] }

export function useUploadEventImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, uris }: Args) => {
      const results = await Promise.allSettled(
        uris.map(uri => eventsService.uploadEventImage(eventId, uri)),
      )
      const failed = results.filter(r => r.status === 'rejected').length
      return { eventId, total: uris.length, failed }
    },
    onSettled: (data, _err, vars) => {
      const id = data?.eventId ?? vars.eventId
      invalidateEventViews(queryClient, id)
    },
  })
}
