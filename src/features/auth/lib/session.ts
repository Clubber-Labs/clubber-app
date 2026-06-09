import { queryClient } from '@/shared/lib/queryClient'
import { clearAuthSession } from '@/shared/lib/secureStore'
import { useAuthStore } from '../store/authStore'
import { useConsentStore } from '@/features/privacy/store/consentStore'
import { usePresenceStore } from '@/features/chat/store/presenceStore'
import { useTypingStore } from '@/features/chat/store/typingStore'

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
  useConsentStore.getState().reset()
  // Estado efêmero do chat (presença/digitando) é estado de módulo: zera pra não
  // vazar entre contas na mesma sessão de app.
  usePresenceStore.getState().reset()
  useTypingStore.getState().reset()
  useAuthStore.getState().logout(expired)
}
