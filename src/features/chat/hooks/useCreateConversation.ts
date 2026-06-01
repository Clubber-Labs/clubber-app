import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  conversationsService,
  type CreateConversationInput,
} from '../services/conversationsService'
import { chatKeys } from './cacheKeys'

// POST /conversations — DM (idempotente: 200 reabre a existente) ou grupo.
// A tela usa mutateAsync e navega para a Conversation retornada.
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateConversationInput) =>
      conversationsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
    },
  })
}
