import { useRouter } from 'expo-router'
import { useAuthStore } from '../store/authStore'
import { endSession } from '../lib/session'

// Logout centralizado: endSession limpa token + caches + estado (e o socket de
// chat fecha reativamente). A navegação explícita deixa a transição imediata —
// o AuthGuard também redirecionaria ao ver status 'unauthenticated'.
export function useLogout() {
  const router = useRouter()

  return async function performLogout() {
    await endSession()
    // Sem splash no meio (regra da spec): direto pra tela de entrada — login
    // pra quem já viu o onboarding neste aparelho.
    router.replace(
      useAuthStore.getState().onboardingSeen
        ? '/(auth)/login'
        : '/(auth)/onboarding',
    )
  }
}
