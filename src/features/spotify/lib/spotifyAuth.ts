// Configuração do OAuth do Spotify (Authorization Code + PKCE).
//
// O app faz SÓ a autorização: recebe o `code` e manda pro nosso backend junto
// do `codeVerifier`. Quem troca por token é o backend, porque a troca exige o
// client secret — e segredo em app publicado não é segredo. É o PKCE que
// amarra as duas metades: sem o verifier, um `code` interceptado no deep link
// não vale nada.
import { makeRedirectUri } from 'expo-auth-session'
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

const SPOTIFY_REDIRECT_PATH = 'spotify-callback'

/**
 * `clubber://spotify-callback`. Este valor é um contrato de TRÊS pontas — o
 * app, o cadastro do Dashboard e o SPOTIFY_REDIRECT_URI do backend (que o
 * reenvia na troca do code, onde o OAuth exige que seja idêntico). Mudar aqui
 * sem mudar nos outros dois derruba a vinculação.
 *
 * O scheme vem do app.config.js em vez de literal: se um dia ele mudar, o
 * authorize passa a ser recusado pelo Spotify com "Invalid redirect URI" — que
 * é bem mais fácil de diagnosticar do que um deep link que não abre o app.
 */
export function spotifyRedirectUri(): string {
  return makeRedirectUri({ path: SPOTIFY_REDIRECT_PATH })
}

export function spotifyClientId(): string | null {
  const id = Constants.expoConfig?.extra?.spotifyClientId as string | undefined
  return id ?? null
}

/** Autorização concluída: o `code` só vira sessão junto do `codeVerifier`. */
export type SpotifyAuthResult =
  | { kind: 'success'; code: string; codeVerifier: string }
  | { kind: 'cancelled' }
