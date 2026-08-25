import { useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'
import type { Conversation, Role } from '../types'
import type { UserMini } from '@/shared/types'

// Ações de admin de grupo. rename/role devolvem a Conversation atualizada
// (escreve direto no cache do detalhe); remove/leave são 204 (invalida).

export function useRenameGroup(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => conversationsService.rename(id, title),
    onSuccess: (conv: Conversation) => {
      queryClient.setQueryData(chatKeys.conversation(id), conv)
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
    },
  })
}

// Recebe o usuário inteiro (não só o id) porque o otimista precisa montar o
// Participant no cache antes da resposta. Sem `onSuccess: setQueryData(conv)` de
// propósito: N adições em paralelo devolvem cada uma a Conversation inteira no
// estado em que o banco estava, e a última a chegar venceria — sumindo com quem
// entrou depois. O invalidate do onSettled reconcilia sem essa corrida.
export function useAddParticipant(id: string) {
  const queryClient = useQueryClient()
  const queryKey = chatKeys.conversation(id)

  return useMutation({
    mutationFn: (user: UserMini) =>
      conversationsService.addParticipant(id, user.id),
    onMutate: async (user: UserMini) => {
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData<Conversation>(queryKey)
      queryClient.setQueryData<Conversation>(queryKey, old =>
        old
          ? {
              ...old,
              participants: [
                ...old.participants,
                { userId: user.id, role: 'MEMBER', user },
              ],
            }
          : old,
      )
      return { prev }
    },
    onError: (_err, _user, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
    },
  })
}

export function useRemoveParticipant(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      conversationsService.removeParticipant(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(id) })
    },
  })
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      conversationsService.updateRole(id, userId, role),
    onSuccess: (conv: Conversation) => {
      queryClient.setQueryData(chatKeys.conversation(id), conv)
    },
  })
}

export function useLeaveGroup(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => conversationsService.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
      queryClient.removeQueries({ queryKey: chatKeys.conversation(id) })
      queryClient.removeQueries({ queryKey: chatKeys.messages(id) })
    },
  })
}
