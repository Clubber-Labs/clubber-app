import { api } from '@/shared/lib/api'
import type { SpotifyProfile } from '../types'

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
}
