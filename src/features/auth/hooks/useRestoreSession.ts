// Pure function (loadSession) + orquestração (useRestoreSession) —
// ver CLAUDE.md → "Separação de responsabilidades".
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { getToken, getUserId, saveUserId } from '@/shared/lib/secureStore'
import type { UserProfile } from '@/shared/types'

type SessionResult =
  | { kind: 'authenticated'; userId: string; profile: UserProfile | null }
  | { kind: 'unauthenticated' }

// 401 é tratado globalmente pelo interceptor em shared/lib/api.ts.
async function loadSession(): Promise<SessionResult> {
  const token = await getToken()
  if (!token) return { kind: 'unauthenticated' }

  const storedUserId = await getUserId()
  if (storedUserId) {
    // Tentar buscar o profile pra detectar profileIncomplete; se falhar
    // (offline, 500), seguimos autenticado e o complete-profile só aparece
    // quando o me() reconectar.
    try {
      const profile = await authService.me()
      return { kind: 'authenticated', userId: storedUserId, profile }
    } catch {
      return { kind: 'authenticated', userId: storedUserId, profile: null }
    }
  }

  try {
    const profile = await authService.me()
    await saveUserId(profile.id)
    return { kind: 'authenticated', userId: profile.id, profile }
  } catch {
    return { kind: 'unauthenticated' }
  }
}

function isProfileIncomplete(profile: UserProfile): boolean {
  return !profile.phone || !profile.birthdate
}

export function useRestoreSession() {
  const setUser = useAuthStore(s => s.setUser)
  const setProfileIncomplete = useAuthStore(s => s.setProfileIncomplete)
  const setHydrated = useAuthStore(s => s.setHydrated)

  useEffect(() => {
    async function run() {
      const session = await loadSession()
      if (session.kind === 'authenticated') {
        if (session.profile) {
          setProfileIncomplete(isProfileIncomplete(session.profile))
        } else {
          // me() falhou (offline/500). Não queremos travar a UI esperando,
          // mas tampouco liberar o feed se o perfil estiver incompleto.
          // Retry em background — quando resolver, AuthGuard reage.
          authService
            .me()
            .then(profile => setProfileIncomplete(isProfileIncomplete(profile)))
            .catch(() => {})
        }
        setUser(session.userId)
      }
      setHydrated()
    }
    run()
  }, [setUser, setProfileIncomplete, setHydrated])
}
