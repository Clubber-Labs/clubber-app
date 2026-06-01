import { useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'
import type { Conversation, Role } from '../types'

// Ações de admin de grupo. add/rename/role devolvem a Conversation atualizada
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

export function useAddParticipant(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      conversationsService.addParticipant(id, userId),
    onSuccess: (conv: Conversation) => {
      queryClient.setQueryData(chatKeys.conversation(id), conv)
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
