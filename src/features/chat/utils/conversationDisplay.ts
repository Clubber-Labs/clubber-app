import { i18n } from '@/shared/i18n'
import type { UserMini } from '@/shared/types'
import type { Conversation, InboxItem, Participant } from '../types'
import { firstAttachmentKind } from './attachmentPreview'

type WithParticipants = {
  type: 'DIRECT' | 'GROUP'
  participants: Participant[]
}

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
  locale: string,
): string {
  if (conv.type === 'GROUP')
    return (
      conv.title?.trim() || i18n.t('chat.conversation.group', { lng: locale })
    )
  const other = others(conv.participants, myId)[0]
  if (!other) return i18n.t('chat.conversation.direct', { lng: locale })
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
export function lastMessagePreview(
  item: InboxItem,
  myId: string,
  locale: string,
): string {
  const msg = item.lastMessage
  if (!msg) return i18n.t('chat.inbox.start', { lng: locale })
  if (msg.deletedAt) return i18n.t('chat.message.deleted', { lng: locale })
  // Aviso do grupo não é fala de ninguém: prefixar com "Você:"/"Fulano:" daria
  // "Você: Neto adicionou Maria".
  if (msg.type === 'SYSTEM') return msg.content ?? ''

  const kind = firstAttachmentKind(msg.attachments)
  const body =
    msg.content && msg.content.length > 0
      ? msg.content
      : kind === 'AUDIO'
        ? i18n.t('chat.attachment.audioPreview', { lng: locale })
        : kind === 'VIDEO'
          ? i18n.t('chat.attachment.videoPreview', { lng: locale })
          : kind === 'IMAGE'
            ? i18n.t('chat.attachment.imagePreview', { lng: locale })
            : ''

  if (msg.senderId === myId)
    return i18n.t('chat.conversation.youPrefix', { lng: locale, body })
  if (item.type === 'GROUP')
    return i18n.t('chat.conversation.senderPrefix', {
      lng: locale,
      name: firstName(msg.sender),
      body,
    })
  return body
}

export function isPreviewItalic(item: InboxItem): boolean {
  return (
    item.lastMessage?.deletedAt != null ||
    item.lastMessage?.type === 'SYSTEM' ||
    item.lastMessage == null
  )
}
