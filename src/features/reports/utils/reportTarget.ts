import type { Report, ReportTargetType } from '../types'
import { TARGET_LABELS } from './reportLabels'

// Deriva o tipo do alvo a partir dos campos preenchidos da denúncia. O backend
// preenche apenas um conjunto (eventId | commentId | messageId | targetUserId)
// e, quando disponível, o objeto aninhado correspondente.
export function reportTargetType(r: Report): ReportTargetType | null {
  if (r.eventId || r.event) return 'event'
  if (r.commentId || r.comment) return 'comment'
  if (r.messageId || r.message) return 'message'
  if (r.targetUserId || r.targetUser) return 'user'
  return null
}

export function reportTargetTypeLabel(r: Report): string {
  const type = reportTargetType(r)
  const label = type ? TARGET_LABELS[type] : 'conteúdo'
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function reportTargetId(r: Report): string | null {
  return (
    r.eventId ??
    r.commentId ??
    r.messageId ??
    r.targetUserId ??
    r.event?.id ??
    r.comment?.id ??
    r.message?.id ??
    r.targetUser?.id ??
    null
  )
}

// Texto de prévia do conteúdo denunciado, quando o backend o inclui.
export function reportTargetPreview(r: Report): string | null {
  if (r.event?.title) return r.event.title
  if (r.comment?.content) return r.comment.content
  if (r.message?.content) return r.message.content
  if (r.targetUser) {
    const name = `${r.targetUser.name} ${r.targetUser.lastname}`.trim()
    return name
      ? `${name} (@${r.targetUser.username})`
      : `@${r.targetUser.username}`
  }
  return null
}
