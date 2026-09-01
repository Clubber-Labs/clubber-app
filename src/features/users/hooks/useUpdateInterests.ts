// Padrão otimista canônico — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '@/shared/types'
import { usersService } from '../services/usersService'
import { mergeProfileCache } from './useProfile'
import { userKeys } from './cacheKeys'

export type InterestsPatch = {
  preferredCategories: string[]
  preferredSubcategories: string[]
}

// A folha de interesses fecha no Salvar; os chips do header já refletem a
// escolha enquanto o PUT viaja, e voltam se ele falhar.
export function useUpdateInterests(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: InterestsPatch) => usersService.update(userId, patch),
    onMutate: async patch => {
      await queryClient.cancelQueries({ queryKey: userKeys.me })
      const prev = queryClient.getQueryData<UserProfile>(userKeys.me)
      queryClient.setQueryData<UserProfile>(userKeys.me, old =>
        old ? { ...old, ...patch } : old,
      )
      return { prev }
    },
    onSuccess: updated => mergeProfileCache(queryClient, updated),
    onError: (_err, _patch, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(userKeys.me, ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.me }),
  })
}
