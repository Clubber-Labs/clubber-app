import { feedKey } from '@/features/events/hooks/cacheKeys'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotifyService } from '../services/spotifyService'

/**
 * Aplica os gêneros importados aos interesses do perfil. Opt-in explícito: só
 * roda quando o usuário confirma, e o backend faz merge (não substitui) —
 * quem ele escolheu à mão continua valendo, e na frente.
 */
export function useApplySpotifyGenres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (genres?: string[]) => spotifyService.applyGenres(genres),
    // Os interesses mudaram: o perfil e o feed que os consomem precisam
    // reler em vez de servir o cache antigo.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.invalidateQueries({ queryKey: feedKey })
    },
  })
}
