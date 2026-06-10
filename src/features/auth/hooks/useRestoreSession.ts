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
import { setUnauthorizedHandler } from '@/shared/lib/api'
import { setAccountRecovery } from '@/features/account/lib/accountRecovery'
import type { UserProfile } from '@/shared/types'

type SessionResult =
  | { kind: 'authenticated'; profile: UserProfile }
  // Conta desativada/agendada para exclusão num device, com token ainda válido
  // aqui (boot). Vai pro login; relogar reativa e dispara o welcome-back.
  | {
      kind: 'inactive'
      userId: string
      status: 'DEACTIVATED' | 'PENDING_DELETION'
      scheduledDeletionAt: string | null
    }
  | { kind: 'unauthenticated' } // sem token, ou 401/404 em /me
  | { kind: 'unavailable' } // rede/5xx — não desloga, mostra offline

// "Logado" = /users/me validado, não só token presente. 401/404 = sessão
// inválida (limpa e vai pro login). Rede/5xx = indisponível (offline + retry).
// Função pura: decide; os efeitos (marker, clear) ficam no orquestrador validate.
async function loadSession(): Promise<SessionResult> {
  const token = await getToken()
  if (!token) return { kind: 'unauthenticated' }

  try {
    const profile = await authService.me()
    if (
      profile.accountStatus === 'DEACTIVATED' ||
      profile.accountStatus === 'PENDING_DELETION'
    ) {
      return {
        kind: 'inactive',
        userId: profile.id,
        status: profile.accountStatus,
        scheduledDeletionAt: profile.scheduledDeletionAt ?? null,
      }
    }
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
    } else if (session.kind === 'inactive') {
      // Boot com conta inativa: grava o marker (welcome-back no relogin) e vai
      // pro login via setUnauthenticated — NÃO endSession({expired}), pois não é
      // sessão expirada (não deve mostrar "Sua sessão expirou"). O clear é
      // parcial de propósito (só auth): por ser boot-only, o queryClient já está
      // vazio e o consentStore reidrata do storage — não precisa do reset deles.
      await setAccountRecovery({
        userId: session.userId,
        status: session.status,
        scheduledDeletionAt: session.scheduledDeletionAt,
      })
      await clearAuthSession()
      setUnauthenticated()
    } else if (session.kind === 'unauthenticated') {
      setUnauthenticated()
    } else {
      setOffline()
    }
  }, [setUser, setProfileIncomplete, setUnauthenticated, setOffline])

  // A reação global a 401 vive na auth (shared/api só sinaliza). Registra antes
  // do boot (este efeito roda antes do de validação) e limpa no unmount.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      endSession({ expired: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Boot: valida antes de entrar nas telas autenticadas.
  useEffect(() => {
    validate()
  }, [validate])

  // Resume (foreground): revalidação SOFT — só encerra a sessão em 401/404; uma
  // falha de rede no resume é ignorada (o usuário continua logado com cache).
  // A rede defensiva de conta inativa (DEACTIVATED/PENDING_DELETION) é tratada
  // SÓ no cold boot (loadSession) — de propósito: evita corrida com a reativação
  // server-side do login e mantém o resume previsível.
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
