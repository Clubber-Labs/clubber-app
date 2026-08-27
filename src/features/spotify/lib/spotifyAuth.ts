// Configuração do OAuth do Spotify (Authorization Code + PKCE).
//
// O app faz SÓ a autorização: recebe o `code` e manda pro nosso backend junto
// do `codeVerifier`. Quem troca por token é o backend, porque a troca exige o
// client secret — e segredo em app publicado não é segredo. É o PKCE que
// amarra as duas metades: sem o verifier, um `code` interceptado no deep link
// não vale nada.
import Constants from 'expo-constants'

export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

/**
 * Os três escopos são pedidos de uma vez, embora hoje só `user-top-read` seja
 * usado: pedir os outros depois obrigaria o usuário a autorizar de novo.
 */
export const SPOTIFY_SCOPES = [
  'user-top-read',
  'user-follow-read',
  'playlist-read-private',
]

/** Precisa bater EXATAMENTE com o registrado no Spotify Dashboard. */
export const SPOTIFY_REDIRECT_PATH = 'spotify-callback'

export function spotifyClientId(): string | null {
  const id = Constants.expoConfig?.extra?.spotifyClientId as string | undefined
  return id ?? null
}

/** Autorização concluída: o `code` só vira sessão junto do `codeVerifier`. */
export type SpotifyAuthResult =
  | { kind: 'success'; code: string; codeVerifier: string }
  | { kind: 'cancelled' }
