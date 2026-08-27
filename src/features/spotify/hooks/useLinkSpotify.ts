import { userKeys } from '@/features/users/hooks/cacheKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { spotifyService } from '../services/spotifyService'
import type { SpotifyProfile } from '../types'
import { spotifyKeys } from './cacheKeys'

export type LinkSpotifyResult =
  | { kind: 'linked'; profile: SpotifyProfile }
  | { kind: 'cancelled' }

type Options = {
  /**
   * Recarregar /users/me depois de vincular. Ligado por padrão, porque o
   * vínculo muda o que o perfil devolve (os top artistas passam a aparecer).
   *
   * O cadastro desliga: lá o formulário ainda vai gravar o perfil, então
   * recarregar é inútil — e pior que inútil, porque a tela de completar perfil
   * desmonta o formulário se esse refetch falhar, apagando o que a pessoa já
   * tinha digitado logo depois de ela ter vinculado com sucesso.
   */
  refreshProfile?: boolean
}

/**
 * Autoriza no Spotify e manda o code pra nossa API. Cancelar não é erro: volta
 * como `kind` da união, então a tela não mostra banner de falha para quem só
 * fechou o navegador.
 */
export function useLinkSpotify({ refreshProfile = true }: Options = {}) {
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
      if (refreshProfile) {
        queryClient.invalidateQueries({ queryKey: userKeys.me })
      }
    },
  })

  return { ...mutation, isReady }
}
