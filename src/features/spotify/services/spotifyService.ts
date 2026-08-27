import { api } from '@/shared/lib/api'
import type { ApplyGenresResult, SpotifyProfile } from '../types'

// Toda a informação do Spotify vem da NOSSA API — o app só fala com o Spotify
// no passo de autorização (useSpotifyAuth). Fonte única, cache normal.
export const spotifyService = {
  getProfile: (): Promise<SpotifyProfile> =>
    api.get('/spotify/profile').then(r => r.data),

  // O `code` só vira vínculo junto do `codeVerifier`: quem troca por token é o
  // backend, que tem o client secret.
  link: (data: {
    code: string
    codeVerifier: string
  }): Promise<SpotifyProfile> =>
    api.post('/spotify/link', data).then(r => r.data),

  unlink: (): Promise<void> =>
    api.delete('/spotify/link').then(() => undefined),

  // `genres` omitido = aplica tudo que o snapshot trouxe. O servidor só aceita
  // chaves que ELE sincronizou — o app não decide o que o usuário ouve.
  applyGenres: (genres?: string[]): Promise<ApplyGenresResult> =>
    api
      .post('/spotify/apply-genres', genres ? { genres } : {})
      .then(r => r.data),
}
