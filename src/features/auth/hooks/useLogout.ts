import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../store/authStore'
import { clearAuthSession } from '@/shared/lib/secureStore'

export function useLogout() {
  const queryClient = useQueryClient()
  const logout = useAuthStore(s => s.logout)
  const router = useRouter()

  return async function performLogout() {
    await clearAuthSession()
    queryClient.clear()
    logout()
    router.replace('/(auth)/login')
  }
}
