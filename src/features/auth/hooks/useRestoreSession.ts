// Pure function (loadSession) + orquestração (useRestoreSession) —
// ver CLAUDE.md → "Separação de responsabilidades".
import { useCallback, useEffect } from 'react'
import { AppState } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { endSession } from '../lib/session'
import {
  getToken,
  clearAuthSession,
  saveUserId,
  saveProfileIncomplete,
} from '@/shared/lib/secureStore'
import { isUnauthorizedError, isNotFoundError } from '@/shared/lib/apiError'
import type { UserProfile } from '@/shared/types'

type SessionResult =
  | { kind: 'authenticated'; profile: UserProfile }
  | { kind: 'unauthenticated' } // sem token, ou 401/404 em /me
  | { kind: 'unavailable' } // rede/5xx — não desloga, mostra offline

// "Logado" = /users/me validado, não só token presente. 401/404 = sessão
// inválida (limpa e vai pro login). Rede/5xx = indisponível (offline + retry).
async function loadSession(): Promise<SessionResult> {
  const token = await getToken()
  if (!token) return { kind: 'unauthenticated' }

  try {
    const profile = await authService.me()
    return { kind: 'authenticated', profile }
  } catch (err) {
    if (isUnauthorizedError(err) || isNotFoundError(err)) {
      await clearAuthSession()
      return { kind: 'unauthenticated' }
    }
    return { kind: 'unavailable' }
  }
}

function isProfileIncomplete(profile: UserProfile): boolean {
  return !profile.phone || !profile.birthdate
}

export function useRestoreSession() {
  const setUser = useAuthStore(s => s.setUser)
  const setProfileIncomplete = useAuthStore(s => s.setProfileIncomplete)
  const setUnauthenticated = useAuthStore(s => s.setUnauthenticated)
  const setOffline = useAuthStore(s => s.setOffline)

  const validate = useCallback(async () => {
    const session = await loadSession()
    if (session.kind === 'authenticated') {
      const incomplete = isProfileIncomplete(session.profile)
      setProfileIncomplete(incomplete)
      await saveProfileIncomplete(incomplete)
      await saveUserId(session.profile.id)
      setUser(session.profile.id)
    } else if (session.kind === 'unauthenticated') {
      setUnauthenticated()
    } else {
      setOffline()
    }
  }, [setUser, setProfileIncomplete, setUnauthenticated, setOffline])

  // Boot: valida antes de entrar nas telas autenticadas.
  useEffect(() => {
    validate()
  }, [validate])

  // Resume (foreground): revalidação SOFT — só encerra a sessão em 401/404; uma
  // falha de rede no resume é ignorada (o usuário continua logado com cache).
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') return
      if (useAuthStore.getState().status !== 'authenticated') return
      authService.me().catch(err => {
        if (isUnauthorizedError(err) || isNotFoundError(err)) {
          endSession({ expired: true })
        }
      })
    })
    return () => sub.remove()
  }, [])

  return { retry: validate }
}
