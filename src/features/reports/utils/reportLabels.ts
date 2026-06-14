import type { ReportReason, ReportTargetType } from '../types'

// Rótulos PT-BR de exibição. Fonte única — nunca hardcodar essas strings na UI.

export const REASON_LABELS: Record<ReportReason, string> = {
  HATE_SPEECH: 'Discurso de ódio',
  SPAM_OR_FRAUD: 'Spam ou fraude',
  HARASSMENT: 'Assédio',
  INAPPROPRIATE_CONTENT: 'Conteúdo inapropriado',
  OTHER: 'Outro',
}

// Ordem de exibição dos motivos no seletor.
export const REASON_OPTIONS: { value: ReportReason; label: string }[] = (
  [
    'HATE_SPEECH',
    'SPAM_OR_FRAUD',
    'HARASSMENT',
    'INAPPROPRIATE_CONTENT',
    'OTHER',
  ] as const
).map(value => ({ value, label: REASON_LABELS[value] }))

// Singular para títulos de sheet ("Denunciar evento") e descrições.
export const TARGET_LABELS: Record<ReportTargetType, string> = {
  event: 'evento',
  post: 'publicação',
  comment: 'comentário',
  message: 'mensagem',
  user: 'usuário',
}

export function reportSheetTitle(type: ReportTargetType): string {
  return `Denunciar ${TARGET_LABELS[type]}`
}
