import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'
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
      queryClient.invalidateQueries({ queryKey: spotKeys.viewportAll })
    },
  })
}
