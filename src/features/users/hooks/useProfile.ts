import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService, type UpdateMePayload } from '../services/usersService'
import { userKeys } from './cacheKeys'
import type { UserProfile } from '@/shared/types'

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
function mergeProfileCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: UserProfile,
) {
  const merge = (prev: UserProfile | undefined): UserProfile =>
    prev ? { ...prev, ...updated } : updated
  queryClient.setQueryData<UserProfile>(userKeys.me, merge)
  queryClient.setQueryData<UserProfile>(userKeys.profile(updated.id), merge)
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
