import type { UserMini } from '@/shared/types'
import type { Conversation, InboxItem, Participant } from '../types'

type WithParticipants = { type: 'DIRECT' | 'GROUP'; participants: Participant[] }

function others(participants: Participant[], myId: string): Participant[] {
  return participants.filter(p => p.userId !== myId)
}

function firstName(user: UserMini): string {
  return user.name.trim().split(' ')[0] || user.name
}

// DM → nome do outro participante; Grupo → title (fallback "Grupo").
export function conversationTitle(
  conv: Pick<Conversation | InboxItem, 'type' | 'title'> & WithParticipants,
  myId: string,
): string {
  if (conv.type === 'GROUP') return conv.title?.trim() || 'Grupo'
  const other = others(conv.participants, myId)[0]
  if (!other) return 'Conversa'
  return `${other.user.name} ${other.user.lastname}`.trim()
}

// Usuários para o avatar: DM → o outro; grupo → até 3 membros (excluindo você).
export function conversationAvatarUsers(
  conv: WithParticipants,
  myId: string,
): UserMini[] {
  const rest = others(conv.participants, myId).map(p => p.user)
  return conv.type === 'DIRECT' ? rest.slice(0, 1) : rest.slice(0, 3)
}

// Texto de preview do lastMessage na inbox. "Mensagem removida" deve ser
// renderizada em itálico — ver isPreviewItalic.
export function lastMessagePreview(item: InboxItem, myId: string): string {
  const msg = item.lastMessage
  if (!msg) return 'Iniciar conversa'
  if (msg.deletedAt) return 'Mensagem removida'

  const body =
    msg.content && msg.content.length > 0
      ? msg.content
      : msg.attachments.length > 0
        ? '📷 Imagem'
        : ''

  if (msg.senderId === myId) return `Você: ${body}`
  if (item.type === 'GROUP') return `${firstName(msg.sender)}: ${body}`
  return body
}

export function isPreviewItalic(item: InboxItem): boolean {
  return item.lastMessage?.deletedAt != null || item.lastMessage == null
}
