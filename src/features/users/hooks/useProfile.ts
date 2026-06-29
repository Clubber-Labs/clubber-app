import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService, type UpdateMePayload } from '../services/usersService'
import { userKeys } from './cacheKeys'
import type { UserProfile } from '@/shared/types'
import type { UserProfileResponse } from '../schemas/userProfileResponse'

export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: usersService.getMe,
  })
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: userKeys.profile(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  })
}

// Algumas rotas (ex: PATCH /users/me/avatar) retornam só os campos
// alterados — o spread preserva o resto (eventsCount, followersCount, etc).
export function mergeProfileCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: UserProfile,
) {
  queryClient.setQueryData<UserProfile>(userKeys.me, prev =>
    prev ? { ...prev, ...updated } : updated,
  )
  // userKeys.profile(id) guarda a união discriminada de GET /users/:id. Aqui é
  // sempre o perfil próprio (logo, full) — funde sobre a variante full.
  queryClient.setQueryData<UserProfileResponse>(
    userKeys.profile(updated.id),
    prev =>
      prev?.kind === 'reduced' ? prev : { ...prev, ...updated, kind: 'full' },
  )
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateMePayload) => usersService.update(userId, data),
    onSuccess: updated => mergeProfileCache(queryClient, updated),
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersService.uploadAvatar,
    onSuccess: updated => mergeProfileCache(queryClient, updated),
  })
}
