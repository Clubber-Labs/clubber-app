import { useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '../services/conversationsService'
import { resetInboxUnread } from '../lib/realtimeCache'

// POST /conversations/:id/read — zera o unread na hora (otimista) e confirma no
// backend. Idempotente, então não precisa de revert.
export function useReadConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.markRead(conversationId),
    onMutate: (conversationId: string) => {
      resetInboxUnread(queryClient, conversationId)
    },
  })
}
