import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import {
  saveToken,
  saveUserId,
  clearAuthSession,
} from '@/shared/lib/secureStore'
import type { RegisterInput, RegisterPayload } from '../schemas/registerSchema'

function toPayload(data: RegisterInput): RegisterPayload {
  return {
    name: data.name,
    lastname: data.lastname,
    username: data.username,
    phone: data.phone,
    email: data.email,
    password: data.password,
    birthdate: data.birthdate.toISOString(),
    bio: data.bio,
    isPrivate: data.isPrivate,
    // Campo opcional: só envia quando há seleção (vazio → omite).
    ...(data.preferredCategories?.length
      ? { preferredCategories: data.preferredCategories }
      : {}),
  }
}

export function useRegister() {
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      await authService.register(toPayload(data))
      const response = await authService.login({
        email: data.email,
        password: data.password,
      })
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
