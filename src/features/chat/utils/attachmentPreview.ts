import type { Attachment, AttachmentKind } from '../types'

// Tipo do primeiro anexo de uma mensagem. Imagens não têm `kind` → 'IMAGE'.
export function firstAttachmentKind(
  attachments: Attachment[] | undefined,
): AttachmentKind | null {
  const first = attachments?.[0]
  if (!first) return null
  return first.kind === 'AUDIO' ? 'AUDIO' : 'IMAGE'
}

// Rótulo curto de uma mensagem sem texto (citação/replyTo). '' se não há anexo.
export function attachmentReplyLabel(
  attachments: Attachment[] | undefined,
): string {
  const kind = firstAttachmentKind(attachments)
  if (kind === 'AUDIO') return 'Áudio'
  if (kind === 'IMAGE') return 'Imagem'
  return ''
}
