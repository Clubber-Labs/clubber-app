import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  usersService,
  type UpdateMePayload,
} from '@/features/users/services/usersService'
import { mergeProfileCache } from '@/features/users/hooks/useProfile'
import { useAuthStore } from '../store/authStore'
import { saveProfileIncomplete } from '@/shared/lib/secureStore'

export function useCompleteProfile(userId: string) {
  const queryClient = useQueryClient()
  const setProfileIncomplete = useAuthStore(s => s.setProfileIncomplete)

  return useMutation({
    mutationFn: (data: UpdateMePayload) => usersService.update(userId, data),
    onSuccess: async updated => {
      mergeProfileCache(queryClient, updated)
      // Persist + memory: AuthGuard libera a shell autenticada e o flag sobrevive
      // a kill/restart sem depender de me() recarregar com sucesso.
      await saveProfileIncomplete(false)
      setProfileIncomplete(false)
    },
  })
}
