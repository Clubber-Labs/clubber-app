import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService, type UpdateMePayload } from '@/features/users/services/usersService'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import { useAuthStore } from '../store/authStore'
import type { UserProfile } from '@/shared/types'

export function useCompleteProfile(userId: string) {
  const queryClient = useQueryClient()
  const setProfileIncomplete = useAuthStore(s => s.setProfileIncomplete)

  return useMutation({
    mutationFn: (data: UpdateMePayload) => usersService.update(userId, data),
    onSuccess: updated => {
      const merge = (prev: UserProfile | undefined): UserProfile =>
        prev ? { ...prev, ...updated } : updated
      queryClient.setQueryData<UserProfile>(userKeys.me, merge)
      queryClient.setQueryData<UserProfile>(userKeys.profile(updated.id), merge)
      // Libera o AuthGuard pra mover pra /(tabs)/feed.
      setProfileIncomplete(false)
    },
  })
}
