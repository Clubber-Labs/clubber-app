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
import { getConflictMessage } from '@/shared/utils/conflictMessage'
import { maybeShowWelcomeBack } from '@/features/account/lib/welcomeBack'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import type { SocialProvider } from '../schemas/socialLoginSchema'

type SocialMutationResult =
  | { kind: 'authenticated'; profileIncomplete: boolean }
  | { kind: 'cancelled' }

// Função pura: mapeia o erro do SDK ou do backend pra uma mensagem PT-BR.
// Banner usa essa mensagem. Cancelamento NUNCA chega aqui — é filtrado antes.
function mapSocialError(error: unknown, provider: SocialProvider): string {
  const providerName = provider === 'google' ? 'Google' : 'Facebook'

  // 409 (conflict) tem prioridade — significa que algum dado do provider já
  // existe vinculado a outra conta (caso raro: backend não fez link por email).
  const conflictMsg = getConflictMessage(error)
  if (conflictMsg) return conflictMsg

  if (isAxiosError(error)) {
    const status = error.response?.status
    const backendMessage = error.response?.data?.message as string | undefined

    if (status === 400) {
      const lower = (backendMessage ?? '').toLowerCase()
      if (lower.includes('email')) {
        return `Sua conta ${providerName} precisa ter um e-mail verificado para entrar.`
      }
      return backendMessage ?? `Não foi possível entrar com ${providerName}.`
    }
    if (status === 401) {
      return `Sua sessão do ${providerName} expirou. Tente novamente.`
    }
    if (status === 502) {
      return `Não conseguimos validar com o ${providerName}. Tente novamente em instantes.`
    }
    if (status && status >= 500) {
      return 'Tivemos um problema no servidor. Tente novamente em instantes.'
    }
    if (!error.response) {
      return `Sem conexão. Verifique sua internet e tente entrar com ${providerName} novamente.`
    }
    return backendMessage ?? `Não foi possível entrar com ${providerName}.`
  }

  return `Não conseguimos entrar com ${providerName}. Tente novamente ou use e-mail/senha.`
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

      await saveToken(response.token)
      await saveRefreshToken(response.refreshToken)
      await saveUserId(response.user.id)
      // Persistir profileIncomplete pra o restore sobreviver a kill/restart sem
      // depender de me() ter sucesso (offline = me() falha, flag persistido vence).
      await saveProfileIncomplete(response.profileIncomplete)

      // Seed do cache do useMe pra evitar refetch imediato e pré-popular o form
      // de completar perfil sem flash de loading.
      queryClient.setQueryData(userKeys.me, response.user)

      // Ordem importa: setar profileIncomplete ANTES de setUser pra evitar
      // flicker pro feed antes do AuthGuard redirecionar pra complete-profile.
      setProfileIncomplete(response.profileIncomplete)
      setUser(response.user.id)

      // Reativação no login social (backend já reativou na carência). Banner
      // dirigido só pelo marker local, amarrado a este userId.
      await maybeShowWelcomeBack(showBanner, response.user.id)

      return {
        kind: 'authenticated',
        profileIncomplete: response.profileIncomplete,
      }
    },
    onError: async error => {
      await clearAuthSession()
      if (error instanceof Error && error.message === 'missing_email') {
        const providerName = provider === 'google' ? 'Google' : 'Facebook'
        showBanner(
          `Sua conta ${providerName} precisa permitir o acesso ao e-mail para entrar.`,
        )
        return
      }
      showBanner(mapSocialError(error, provider))
    },
  })
}
