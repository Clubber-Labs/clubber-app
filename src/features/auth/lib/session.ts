import { queryClient } from '@/shared/lib/queryClient'
import { clearAuthSession } from '@/shared/lib/secureStore'
import { useAuthStore } from '../store/authStore'

// Encerramento centralizado da sessão — reusado pelo interceptor 401 e pelo
// botão Sair. Limpa secure storage + caches + estado em memória. A navegação
// pro login e o fechamento do socket de chat acontecem reativamente: o
// AuthGuard redireciona quando status vira 'unauthenticated' e o
// ChatRealtimeMount desmonta quando isAuthenticated vira false (chatSocket.stop).
export async function endSession({
  expired = false,
}: { expired?: boolean } = {}) {
  await clearAuthSession()
  queryClient.clear()
  useAuthStore.getState().logout(expired)
}
