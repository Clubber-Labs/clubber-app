import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import {
  saveToken,
  saveRefreshToken,
  saveUserId,
  clearAuthSession,
} from '@/shared/lib/secureStore'
import { useBanner } from '@/shared/lib/banner'
import { maybeShowWelcomeBack } from '@/features/account/lib/welcomeBack'
import type { LoginInput } from '../schemas/loginSchema'

export function useLogin() {
  const setUser = useAuthStore(s => s.setUser)
  const showBanner = useBanner()

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await authService.login(data)
      const token = response.token
      await saveToken(token)
      await saveRefreshToken(response.refreshToken)

      try {
        const userId = response.userId ?? (await authService.me()).id
        await saveUserId(userId)
        return { token, userId }
      } catch (err) {
        await clearAuthSession()
        throw err
      }
    },
    onSuccess: ({ userId }) => {
      setUser(userId)
      // Reativação no login: o backend já reativou na carência; o banner é
      // dirigido só pelo marker local (a resposta de login não traz accountStatus).
      void maybeShowWelcomeBack(showBanner, userId)
    },
  })
}
