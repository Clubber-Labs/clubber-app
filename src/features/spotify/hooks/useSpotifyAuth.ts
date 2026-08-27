import { useAuthRequest } from 'expo-auth-session'
import { useCallback } from 'react'
import {
  SPOTIFY_DISCOVERY,
  SPOTIFY_SCOPES,
  type SpotifyAuthResult,
  spotifyClientId,
  spotifyRedirectUri,
} from '../lib/spotifyAuth'

/**
 * Autorização do Spotify (PKCE). Devolve `code` + `codeVerifier` para o app
 * mandar à NOSSA API — o app nunca troca o code por token nem fala com a API
 * do Spotify fora deste passo.
 *
 * `isReady` distingue "sem client id no build" de "ainda carregando": sem a
 * credencial a tela some em vez de oferecer um botão que só daria erro.
 */
export function useSpotifyAuth() {
  const clientId = spotifyClientId()

  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: clientId ?? '',
      scopes: SPOTIFY_SCOPES,
      usePKCE: true,
      redirectUri: spotifyRedirectUri(),
    },
    SPOTIFY_DISCOVERY,
  )

  const authorize = useCallback(async (): Promise<SpotifyAuthResult> => {
    if (!request?.codeVerifier) {
      throw new Error('Autorização do Spotify indisponível neste build.')
    }

    const result = await promptAsync()

    if (result.type === 'success') {
      const code = result.params.code
      if (!code) throw new Error('Spotify não retornou o code de autorização.')
      return { kind: 'success', code, codeVerifier: request.codeVerifier }
    }

    // Recusar na tela do Spotify é desistir, não falhar: o OAuth devolve isso
    // como `error`, mas para o usuário é o mesmo que fechar o navegador.
    if (result.type === 'error') {
      if (result.error?.code === 'access_denied') return { kind: 'cancelled' }
      throw result.error ?? new Error('Falha ao autorizar no Spotify.')
    }

    return { kind: 'cancelled' }
  }, [request, promptAsync])

  return { authorize, isReady: !!clientId && !!request }
}
