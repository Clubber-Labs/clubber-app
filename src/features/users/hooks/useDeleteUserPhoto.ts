// Optimistic remove — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import type {
  CursorPaginatedResponse,
  UserPhoto,
  UserProfile,
} from '@/shared/types'
import { usersService } from '../services/usersService'
import { userKeys } from './cacheKeys'

type PhotosCache = InfiniteData<CursorPaginatedResponse<UserPhoto>>

function decrementPhotos(prev: UserProfile | undefined) {
  if (!prev || prev.photosCount === undefined) return prev
  return { ...prev, photosCount: Math.max(0, prev.photosCount - 1) }
}

export function useDeleteUserPhoto(userId: string) {
  const queryClient = useQueryClient()
  const listKey = userKeys.photos(userId)

  return useMutation({
    mutationFn: (photoId: string) => usersService.deletePhoto(photoId),
    onMutate: async photoId => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const list = queryClient.getQueryData<PhotosCache>(listKey)
      const me = queryClient.getQueryData<UserProfile>(userKeys.me)
      queryClient.setQueryData<PhotosCache>(listKey, old =>
        removeFromInfiniteList(old, photoId),
      )
      queryClient.setQueryData<UserProfile>(userKeys.me, decrementPhotos)
      return { list, me }
    },
    onError: (_err, _id, ctx) => {
      if (!ctx) return
      queryClient.setQueryData(listKey, ctx.list)
      queryClient.setQueryData(userKeys.me, ctx.me)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}
