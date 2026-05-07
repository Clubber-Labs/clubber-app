import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { getToken, getUserId, saveUserId } from '@/shared/lib/secureStore'

type SessionResult =
  | { kind: 'authenticated'; userId: string }
  | { kind: 'unauthenticated' }

/**
 * Resolve a sessão a partir do SecureStore, recuperando o userId via API
 * quando o token existe mas o userId não está persistido (estado legado).
 *
 * Falhas de 401 são tratadas globalmente pelo interceptor do axios
 * (`shared/lib/api.ts`), que limpa a sessão e dispara o logout.
 */
async function loadSession(): Promise<SessionResult> {
  const token = await getToken()
  if (!token) return { kind: 'unauthenticated' }

  const storedUserId = await getUserId()
  if (storedUserId) return { kind: 'authenticated', userId: storedUserId }

  try {
    const me = await authService.me()
    await saveUserId(me.id)
    return { kind: 'authenticated', userId: me.id }
  } catch {
    return { kind: 'unauthenticated' }
  }
}

export function useRestoreSession() {
  const setUser = useAuthStore(s => s.setUser)
  const setHydrated = useAuthStore(s => s.setHydrated)

  useEffect(() => {
    async function run() {
      const session = await loadSession()
      if (session.kind === 'authenticated') {
        setUser(session.userId)
        // valida em background — interceptor cuida do 401
        authService.me().catch(() => {})
      }
      setHydrated()
    }
    run()
  }, [setUser, setHydrated])
}
