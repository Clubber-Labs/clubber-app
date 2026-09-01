import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/authStore'
import { usersService, type CreatePhotoPayload } from '../services/usersService'
import { userKeys } from './cacheKeys'

// Sem otimismo: a publicação só existe com as imagens no servidor, e o mural
// entra quando a lista invalida. O erro fica com a tela (form → inline).
export function useCreateUserPhoto() {
  const queryClient = useQueryClient()
  const myId = useAuthStore(s => s.userId)

  return useMutation({
    mutationFn: (payload: CreatePhotoPayload) =>
      usersService.createPhoto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me })
      if (myId) {
        queryClient.invalidateQueries({ queryKey: userKeys.photos(myId) })
        queryClient.invalidateQueries({ queryKey: userKeys.profile(myId) })
      }
    },
  })
}
