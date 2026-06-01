import { useRouter } from 'expo-router'
import { endSession } from '../lib/session'

// Logout centralizado: endSession limpa token + caches + estado (e o socket de
// chat fecha reativamente). A navegação explícita deixa a transição imediata —
// o AuthGuard também redirecionaria ao ver status 'unauthenticated'.
export function useLogout() {
  const router = useRouter()

  return async function performLogout() {
    await endSession()
    router.replace('/(auth)/login')
  }
}
