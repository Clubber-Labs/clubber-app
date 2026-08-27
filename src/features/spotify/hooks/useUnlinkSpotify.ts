import { userKeys } from '@/features/users/hooks/cacheKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotifyService } from '../services/spotifyService'
import { spotifyKeys } from './cacheKeys'

export function useUnlinkSpotify() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: spotifyService.unlink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spotifyKeys.all })
      // Os top artistas somem do perfil junto com o vínculo.
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}
