import type { ReportReason, ReportStatus, ReportTargetType } from '../types'

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

export const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendente',
  REVIEWED: 'Em análise',
  RESOLVED_INVALID: 'Improcedente',
  RESOLVED_REMOVED: 'Resolvida com remoção',
}

// Cores do badge de status (tema dark). Texto + fundo translúcido por status.
export const STATUS_COLORS: Record<ReportStatus, { text: string; bg: string }> =
  {
    PENDING: { text: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    REVIEWED: { text: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    RESOLVED_INVALID: { text: '#a1a1aa', bg: 'rgba(161,161,170,0.15)' },
    RESOLVED_REMOVED: { text: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  }

// Singular para títulos de sheet ("Denunciar evento") e descrições.
export const TARGET_LABELS: Record<ReportTargetType, string> = {
  event: 'evento',
  comment: 'comentário',
  message: 'mensagem',
  user: 'usuário',
}

export function reportSheetTitle(type: ReportTargetType): string {
  return `Denunciar ${TARGET_LABELS[type]}`
}
