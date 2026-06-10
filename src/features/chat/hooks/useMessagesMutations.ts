import type { UserMini } from '@/shared/types'
import { useSendMessage } from './useSendMessage'
import { useSendImage } from './useSendImage'
import { useSendAudio } from './useSendAudio'
import { useSendVideo } from './useSendVideo'
import { useDeleteMessage } from './useDeleteMessage'
import { useEditMessage } from './useEditMessage'

// Agrupa as mutations de mensagem de uma conversa para a tela consumir num lugar só.
export function useMessagesMutations(conversationId: string, me: UserMini) {
  const send = useSendMessage(conversationId, me)
  const sendImage = useSendImage(conversationId, me)
  const sendAudio = useSendAudio(conversationId, me)
  const sendVideo = useSendVideo(conversationId, me)
  const deleteMessage = useDeleteMessage(conversationId)
  const edit = useEditMessage(conversationId)
  return { send, sendImage, sendAudio, sendVideo, deleteMessage, edit }
}
