import { create } from 'zustand'

type AuthState = {
  userId: string | null
  isAuthenticated: boolean
  setUser: (userId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  userId: null,
  isAuthenticated: false,
  setUser: userId => set({ userId, isAuthenticated: true }),
  logout: () => set({ userId: null, isAuthenticated: false }),
}))
