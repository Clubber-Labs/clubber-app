import { userKeys } from '@/features/users/hooks/cacheKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { spotifyService } from '../services/spotifyService'
import type { SpotifyProfile } from '../types'
import { spotifyKeys } from './cacheKeys'

/**
 * Esconde ou revela um artista no perfil. Otimista: o cartão apaga na hora e
 * volta se o PATCH falhar — esperar a rede pra ver o toque surtir efeito
 * tornaria a lista inteira lenta de configurar.
 *
 * O endpoint recebe a lista completa (substituição), então o hook monta a
 * lista nova a partir do que está em cache.
 */
export function useHiddenArtists() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hiddenArtistIds: string[]) =>
      spotifyService.setHiddenArtists(hiddenArtistIds),
    onMutate: async (hiddenArtistIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: spotifyKeys.profile })
      const previous = queryClient.getQueryData<SpotifyProfile>(
        spotifyKeys.profile,
      )
      const hidden = new Set(hiddenArtistIds)
      queryClient.setQueryData<SpotifyProfile>(spotifyKeys.profile, current =>
        current
          ? {
              ...current,
              artists: current.artists.map(a => ({
                ...a,
                hidden: hidden.has(a.id),
              })),
            }
          : current,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(spotifyKeys.profile, context.previous)
      }
    },
    onSuccess: profile => {
      queryClient.setQueryData(spotifyKeys.profile, profile)
      // O perfil mostra a fileira já filtrada pelo servidor: sem isto ele
      // seguiria exibindo quem acabou de ser escondido.
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
