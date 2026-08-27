import { userKeys } from '@/features/users/hooks/cacheKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { spotifyService } from '../services/spotifyService'
import type { SpotifyProfile } from '../types'
import { spotifyKeys } from './cacheKeys'

export type LinkSpotifyResult =
  | { kind: 'linked'; profile: SpotifyProfile }
  | { kind: 'cancelled' }

/**
 * Autoriza no Spotify e manda o code pra nossa API. Cancelar não é erro: volta
 * como `kind` da união, então a tela não mostra banner de falha para quem só
 * fechou o navegador.
 *
 * O perfil do usuário é invalidado junto porque o vínculo muda o que
 * /users/me devolve (os top artistas passam a aparecer).
 */
export function useLinkSpotify() {
  const queryClient = useQueryClient()
  const { authorize, isReady } = useSpotifyAuth()

  const mutation = useMutation<LinkSpotifyResult>({
    mutationFn: async () => {
      const auth = await authorize()
      if (auth.kind === 'cancelled') return { kind: 'cancelled' }

      const profile = await spotifyService.link({
        code: auth.code,
        codeVerifier: auth.codeVerifier,
      })
      return { kind: 'linked', profile }
    },
    onSuccess: result => {
      if (result.kind !== 'linked') return
      queryClient.setQueryData(spotifyKeys.profile, result.profile)
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })

  return { ...mutation, isReady }
}
