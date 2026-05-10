import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'

// Redireciona pra aba "Meu Perfil" quando o id é do próprio viewer —
// /users/:id não retorna campos privados (email, phone, birthdate).
export function useNavigateToProfile() {
  const router = useRouter()
  const viewerId = useAuthStore(s => s.userId)

  return useCallback(
    (userId: string) => {
      if (!userId) return
      if (userId === viewerId) {
        router.push('/(tabs)/profile')
      } else {
        router.push(`/users/${userId}`)
      }
    },
    [router, viewerId],
  )
}
