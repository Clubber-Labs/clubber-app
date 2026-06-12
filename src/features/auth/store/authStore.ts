import { create } from 'zustand'

export type SessionStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'offline'

type AuthState = {
  userId: string | null
  status: SessionStatus
  profileIncomplete: boolean
  // true quando a sessão caiu por 401 (expirada/revogada) — login mostra aviso.
  sessionExpired: boolean
  // Derivados de `status`, mantidos sincronizados pelas ações para os
  // consumidores existentes (índice, layout, chat) não precisarem mudar.
  isAuthenticated: boolean
  hydrated: boolean
  setUser: (userId: string) => void
  setProfileIncomplete: (value: boolean) => void
  setOffline: () => void
  setUnauthenticated: () => void
  logout: (expired?: boolean) => void
  acknowledgeExpired: () => void
}

function flags(status: SessionStatus) {
  return {
    status,
    isAuthenticated: status === 'authenticated',
    hydrated: status !== 'loading',
  }
}

export const useAuthStore = create<AuthState>(set => ({
  userId: null,
  status: 'loading',
  profileIncomplete: false,
  sessionExpired: false,
  isAuthenticated: false,
  hydrated: false,
  setUser: userId =>
    set({ ...flags('authenticated'), userId, sessionExpired: false }),
  setProfileIncomplete: value => set({ profileIncomplete: value }),
  setOffline: () => set(flags('offline')),
  // Boot sem sessão válida — preserva sessionExpired (o interceptor pode tê-lo
  // marcado no 401 do próprio /me).
  setUnauthenticated: () =>
    set({
      ...flags('unauthenticated'),
      userId: null,
      profileIncomplete: false,
    }),
  logout: (expired = false) =>
    set({
      ...flags('unauthenticated'),
      userId: null,
      profileIncomplete: false,
      sessionExpired: expired,
    }),
  acknowledgeExpired: () => set({ sessionExpired: false }),
}))
