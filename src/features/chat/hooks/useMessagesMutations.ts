import type { UserMini } from '@/shared/types'
import { useSendMessage } from './useSendMessage'
import { useSendImage } from './useSendImage'
import { useDeleteMessage } from './useDeleteMessage'

// Agrupa as mutations de mensagem de uma conversa para a tela consumir num lugar só.
export function useMessagesMutations(conversationId: string, me: UserMini) {
  const send = useSendMessage(conversationId, me)
  const sendImage = useSendImage(conversationId, me)
  const deleteMessage = useDeleteMessage(conversationId)
  return { send, sendImage, deleteMessage }
}
