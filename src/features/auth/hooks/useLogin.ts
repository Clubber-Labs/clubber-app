import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { saveToken } from '@/shared/lib/secureStore'
import type { LoginInput } from '../schemas/loginSchema'

export function useLogin() {
  const setUser = useAuthStore(s => s.setUser)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: async response => {
      await saveToken(response.token)
      setUser(response.userId)
      router.replace('/(tabs)/feed')
    },
  })
}
