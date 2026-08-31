import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys, spotListKeys } from './cacheKeys'
import {
  toSpotPayload,
  type CreateSpotInput,
} from '../schemas/createSpotSchema'

export function useCreateSpot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSpotInput) =>
      spotsService.create(toSpotPayload(data)),
    onSuccess: spot => {
      // Semeia a detail pra navegação pós-publicação não refetchar à toa.
      queryClient.setQueryData(spotKeys.detail(spot.id), spot)
      for (const key of spotListKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}
