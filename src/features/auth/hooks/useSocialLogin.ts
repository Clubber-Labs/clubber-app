import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { signInWithGoogle } from '../lib/googleSignIn'
import { signInWithFacebook } from '../lib/facebookLogin'
import {
  saveToken,
  saveRefreshToken,
  saveUserId,
  saveProfileIncomplete,
  clearAuthSession,
} from '@/shared/lib/secureStore'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { i18n } from '@/shared/i18n'
import { needsRolePreferences } from '@/shared/utils/rolePreferences'
import { maybeShowWelcomeBack } from '@/features/account/lib/welcomeBack'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import type { SocialProvider } from '../schemas/socialLoginSchema'

type SocialMutationResult =
  | { kind: 'authenticated'; profileIncomplete: boolean }
  | { kind: 'cancelled' }

// Erro vindo da API passa pelo contrato de código (getApiError já traduz e já
// interpola o provider nos códigos que o trazem em `params`). Só o que nasce no
// SDK, sem resposta HTTP, precisa de mensagem própria aqui.
// Cancelamento NUNCA chega aqui — é filtrado antes.
function mapSocialError(error: unknown, provider: SocialProvider): string {
  if (isAxiosError(error)) return getApiError(error).message

  return i18n.t('auth.social.fallback', {
    provider: provider === 'google' ? 'Google' : 'Facebook',
  })
}

async function getProviderToken(
  provider: SocialProvider,
): Promise<
  | { kind: 'token'; token: string }
  | { kind: 'cancelled' }
  | { kind: 'missing_email' }
> {
  if (provider === 'google') {
    const result = await signInWithGoogle()
    if (result.kind === 'cancelled') return { kind: 'cancelled' }
    return { kind: 'token', token: result.idToken }
  }
  const result = await signInWithFacebook()
  if (result.kind === 'cancelled') return { kind: 'cancelled' }
  if (result.kind === 'missing_email') return { kind: 'missing_email' }
  return { kind: 'token', token: result.accessToken }
}

export function useSocialLogin(provider: SocialProvider) {
  const setUser = useAuthStore(s => s.setUser)
  const setProfileIncomplete = useAuthStore(s => s.setProfileIncomplete)
  const showBanner = useBanner()
  const queryClient = useQueryClient()

  return useMutation<SocialMutationResult, unknown, void>({
    mutationFn: async () => {
      const tokenResult = await getProviderToken(provider)
      if (tokenResult.kind === 'cancelled') {
        return { kind: 'cancelled' }
      }
      if (tokenResult.kind === 'missing_email') {
        // Tratado igual a um erro 400 de email não verificado.
        throw new Error('missing_email')
      }

      const response = await authService.socialLogin({
        provider,
        token: tokenResult.token,
      })

      // Login social cria a conta sem passar pelo cadastro, então pode nascer
      // sem preferência. Força completar perfil também quando há menos de 2
      // categorias de rolê — não só pelo flag do backend. Só considera o campo
      // quando ele vem na resposta (selects reduzidos o omitem): um perfil sem o
      // campo é confirmado pelo /users/me completo no próximo boot, evitando
      // mandar de volta quem já tem categorias.
      const incomplete =
        response.profileIncomplete ||
        (Array.isArray(response.user.preferredCategories) &&
          needsRolePreferences(response.user))

      await saveToken(response.token)
      await saveRefreshToken(response.refreshToken)
      await saveUserId(response.user.id)
      // Persistir profileIncomplete pra o restore sobreviver a kill/restart sem
      // depender de me() ter sucesso (offline = me() falha, flag persistido vence).
      await saveProfileIncomplete(incomplete)

      // Seed do cache do useMe pra evitar refetch imediato e pré-popular o form
      // de completar perfil sem flash de loading.
      queryClient.setQueryData(userKeys.me, response.user)

      // Ordem importa: setar profileIncomplete ANTES de setUser pra evitar
      // flicker pro feed antes do AuthGuard redirecionar pra complete-profile.
      setProfileIncomplete(incomplete)
      setUser(response.user.id)

      // Reativação no login social (backend já reativou na carência). Banner
      // dirigido só pelo marker local, amarrado a este userId.
      await maybeShowWelcomeBack(showBanner, response.user.id)

      return {
        kind: 'authenticated',
        profileIncomplete: incomplete,
      }
    },
    onError: async error => {
      await clearAuthSession()
      if (error instanceof Error && error.message === 'missing_email') {
        showBanner(
          i18n.t('auth.social.missingEmail', {
            provider: provider === 'google' ? 'Google' : 'Facebook',
          }),
        )
        return
      }
      showBanner(mapSocialError(error, provider))
    },
  })
}
