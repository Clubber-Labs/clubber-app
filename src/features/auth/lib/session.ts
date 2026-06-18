import { queryClient } from '@/shared/lib/queryClient'
import { clearAuthSession, getRefreshToken } from '@/shared/lib/secureStore'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { useConsentStore } from '@/features/privacy/store/consentStore'
import { usePresenceStore } from '@/features/chat/store/presenceStore'
import { useTypingStore } from '@/features/chat/store/typingStore'
import { disablePush } from '@/features/notifications/lib/pushRegistration'
import { clearNotificationStorage } from '@/features/notifications/lib/storage'
import { useNotificationPrefsStore } from '@/features/notifications/store/notificationPrefsStore'

// Guard de reentrância: um encerramento já em curso "ganha". Sem isto, um logout
// VOLUNTÁRIO (expired:false) podia ser sobrescrito por um endSession({expired:true})
// concorrente — disparado por um request HTTP em voo que volta 401 ou por um
// socket reconectando sem token DURANTE o logout — fazendo subir o banner "Sua
// sessão expirou" indevidamente. A PRIMEIRA chamada define o motivo; as demais
// recebem a mesma promise e são ignoradas.
let ending: Promise<void> | null = null

// Encerramento centralizado da sessão — reusado pelo interceptor 401 e pelo
// botão Sair. Limpa secure storage + caches + estado em memória. A navegação
// pro login e o fechamento dos sockets (chat/notificações) acontecem
// reativamente: o AuthGuard redireciona quando status vira 'unauthenticated'
// e os mounts desmontam quando isAuthenticated vira false (socket.stop).
export function endSession(opts: { expired?: boolean } = {}): Promise<void> {
  if (ending) return ending
  ending = runEndSession(opts).finally(() => {
    ending = null
  })
  return ending
}

async function runEndSession({ expired = false }: { expired?: boolean } = {}) {
  // Direito ao esquecimento: remove o device token do backend ANTES de apagar
  // o JWT (a chamada precisa dele). Best-effort — em sessão expirada o token
  // já é inválido e o backend invalida o device via push receipts.
  try {
    await disablePush()
  } catch {
    // ignore
  }
  // Logout server-side: revoga o refresh token atual no backend (best-effort).
  // Pulamos quando a sessão já expirou — o access é inválido e a chamada cairia
  // em 401 (e o refresh já foi/está sendo invalidado de qualquer forma).
  if (!expired) {
    try {
      const refreshToken = await getRefreshToken()
      if (refreshToken) await authService.logout(refreshToken)
    } catch {
      // ignore — falha de rede/401 não bloqueia o logout local
    }
  }
  await clearNotificationStorage()
  await clearAuthSession()
  queryClient.clear()
  useConsentStore.getState().reset()
  // Estado efêmero do chat (presença/digitando) é estado de módulo: zera pra não
  // vazar entre contas na mesma sessão de app.
  usePresenceStore.getState().reset()
  useTypingStore.getState().reset()
  useNotificationPrefsStore.getState().reset()
  useAuthStore.getState().logout(expired)
}
