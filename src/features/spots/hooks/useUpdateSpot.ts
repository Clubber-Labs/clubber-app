import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys, spotListKeys } from './cacheKeys'
import {
  toUpdateSpotPayload,
  type EditSpotInput,
} from '../schemas/editSpotSchema'

export function useUpdateSpot(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EditSpotInput) =>
      spotsService.update(id, toUpdateSpotPayload(data)),
    onSuccess: spot => {
      queryClient.setQueryData(spotKeys.detail(id), spot)
      for (const key of spotListKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}
