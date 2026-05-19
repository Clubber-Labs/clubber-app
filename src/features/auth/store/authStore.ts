import { create } from 'zustand'

type AuthState = {
  userId: string | null
  isAuthenticated: boolean
  hydrated: boolean
  profileIncomplete: boolean
  setUser: (userId: string) => void
  setProfileIncomplete: (value: boolean) => void
  logout: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  userId: null,
  isAuthenticated: false,
  hydrated: false,
  profileIncomplete: false,
  setUser: userId => set({ userId, isAuthenticated: true }),
  setProfileIncomplete: value => set({ profileIncomplete: value }),
  logout: () =>
    set({ userId: null, isAuthenticated: false, profileIncomplete: false }),
  setHydrated: () => set({ hydrated: true }),
}))
