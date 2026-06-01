import { useQuery } from '@tanstack/react-query'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'

export function useConversation(id: string) {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: () => conversationsService.getById(id),
    enabled: !!id,
  })
}
