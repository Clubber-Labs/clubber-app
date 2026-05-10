import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import {
  saveToken,
  saveUserId,
  clearAuthSession,
} from '@/shared/lib/secureStore'
import type { LoginInput } from '../schemas/loginSchema'

export function useLogin() {
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await authService.login(data)
      const token = response.token as string
      await saveToken(token)

      try {
        const userId =
          (response.userId as string | undefined) ??
          (await authService.me()).id
        await saveUserId(userId)
        return { token, userId }
      } catch (err) {
        await clearAuthSession()
        throw err
      }
    },
    onSuccess: ({ userId }) => {
      setUser(userId)
    },
  })
}
