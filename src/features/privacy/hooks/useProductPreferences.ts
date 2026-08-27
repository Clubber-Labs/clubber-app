import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { usersService } from '@/features/users/services/usersService'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import type { UserProfile } from '@/shared/types'
import type { ProductPreferences } from '../constants'

const DEFAULTS: ProductPreferences = {
  socialFeed: true,
  socialVisibility: true,
  analytics: true,
  spotifyArtistsVisible: true,
  spotifyTopArtistVisible: true,
  // Único que nasce desligado: expõe três janelas onde havia uma.
  spotifyWindowVisible: false,
}

/**
 * Preferências de produto (opt-out) — moram no PERFIL, não no registro de
 * consentimento: são configuração, não declaração de vontade. Mandá-las num
 * PATCH /consent é erro de validação.
 *
 * O default é `true` no servidor; o `??` cobre só o perfil que ainda não trouxe
 * o campo (backend mais antigo), não uma escolha do usuário.
 */
export function useProductPreferences() {
  const queryClient = useQueryClient()
  const { data: profile } = useMyProfile()

  const preferences: ProductPreferences = {
    socialFeed: profile?.socialFeed ?? DEFAULTS.socialFeed,
    socialVisibility: profile?.socialVisibility ?? DEFAULTS.socialVisibility,
    analytics: profile?.analytics ?? DEFAULTS.analytics,
    spotifyArtistsVisible:
      profile?.spotifyArtistsVisible ?? DEFAULTS.spotifyArtistsVisible,
    spotifyTopArtistVisible:
      profile?.spotifyTopArtistVisible ?? DEFAULTS.spotifyTopArtistVisible,
    spotifyWindowVisible:
      profile?.spotifyWindowVisible ?? DEFAULTS.spotifyWindowVisible,
  }

  /**
   * Otimista com reconciliação: o switch vira na hora e volta se o PUT falhar.
   * Escreve direto no cache do perfil — é de lá que a tela lê.
   */
  const updatePreference = useCallback(
    async (key: keyof ProductPreferences, value: boolean): Promise<boolean> => {
      if (!profile) return false
      const previous = queryClient.getQueryData<UserProfile>(userKeys.me)

      queryClient.setQueryData<UserProfile>(userKeys.me, current =>
        current ? { ...current, [key]: value } : current,
      )
      try {
        const updated = await usersService.update(profile.id, { [key]: value })
        queryClient.setQueryData<UserProfile>(userKeys.me, updated)
        return true
      } catch {
        if (previous) queryClient.setQueryData(userKeys.me, previous)
        return false
      }
    },
    [profile, queryClient],
  )

  return { preferences, updatePreference }
}
