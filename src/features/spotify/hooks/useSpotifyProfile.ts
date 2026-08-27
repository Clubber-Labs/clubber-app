import { useQuery } from '@tanstack/react-query'
import { spotifyService } from '../services/spotifyService'
import { spotifyKeys } from './cacheKeys'

// Sem vínculo o backend devolve `{ linked: false }` com 200 — estado normal,
// não erro. O card lê isso direto, sem tratar 404.
export function useSpotifyProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: spotifyKeys.profile,
    queryFn: spotifyService.getProfile,
    enabled: options?.enabled ?? true,
  })
}
