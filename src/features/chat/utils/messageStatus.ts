import type { ChatMessage, Participant } from '../types'

export type MessageStatus = 'sending' | 'failed' | 'sent' | 'delivered' | 'read'

// Status de uma mensagem MINHA (null se não for minha — só o autor vê o status).
// Watermark por participante: 'read'/'delivered' exige que TODOS os outros tenham
// lido/recebido até o createdAt (em DM "todos" = o outro; em grupo, todo mundo).
// Sem lastDeliveredAt (backend ainda não envia) o passo 'delivered' é pulado e o
// status degrada pra 'sent' — nada quebra.
export function messageStatus(
  message: ChatMessage,
  myId: string,
  others: Participant[],
): MessageStatus | null {
  if (message.senderId !== myId) return null
  if (message.clientStatus === 'sending') return 'sending'
  if (message.clientStatus === 'failed') return 'failed'
  if (others.length === 0) return 'sent'

  const createdMs = new Date(message.createdAt).getTime()
  const reachedBy = (at: string | null | undefined) =>
    !!at && new Date(at).getTime() >= createdMs

  if (others.every(p => reachedBy(p.lastReadAt))) return 'read'
  if (others.every(p => reachedBy(p.lastDeliveredAt))) return 'delivered'
  return 'sent'
}
