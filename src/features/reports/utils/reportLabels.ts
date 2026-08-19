import type { ReportReason, ReportTargetType } from '../types'

// Chaves de exibição — fonte única. Frase pronta aqui avaliaria no import e
// congelaria o idioma; a tradução acontece no componente.
export const REASON_LABEL_KEYS = {
  HATE_SPEECH: 'reports.reasons.HATE_SPEECH',
  SPAM_OR_FRAUD: 'reports.reasons.SPAM_OR_FRAUD',
  HARASSMENT: 'reports.reasons.HARASSMENT',
  INAPPROPRIATE_CONTENT: 'reports.reasons.INAPPROPRIATE_CONTENT',
  OTHER: 'reports.reasons.OTHER',
} as const satisfies Record<ReportReason, string>

// Ordem de exibição dos motivos no seletor.
export const REASON_OPTIONS = (
  [
    'HATE_SPEECH',
    'SPAM_OR_FRAUD',
    'HARASSMENT',
    'INAPPROPRIATE_CONTENT',
    'OTHER',
  ] as const
).map(value => ({ value, labelKey: REASON_LABEL_KEYS[value] }))

// Título do sheet por alvo. Chave inteira por tipo (e não "Denunciar" + nome):
// em outros idiomas a frase não é concatenação de duas partes.
export const REPORT_TITLE_KEYS = {
  event: 'reports.titleFor.event',
  post: 'reports.titleFor.post',
  comment: 'reports.titleFor.comment',
  message: 'reports.titleFor.message',
  user: 'reports.titleFor.user',
} as const satisfies Record<ReportTargetType, string>
