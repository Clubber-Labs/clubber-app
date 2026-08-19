// Motivos de saída exibidos na exclusão de conta. Fonte única — nunca hardcodar
// as strings na UI. O backend armazena o `reason` (≤500) para analytics de churn:
// envia-se o `value` estável nas categorias e o texto livre quando 'OTHER'.

export type DeleteReason =
  | 'PRIVACY'
  | 'TOO_MUCH_TIME'
  | 'FRESH_START'
  | 'NOT_USEFUL'
  | 'TECH_ISSUES'
  | 'OTHER'

// Chaves, não frases: o módulo avalia no import e congelaria o idioma. A
// tradução acontece na exibição (DeleteReasonStep).
export const DELETE_REASON_LABEL_KEYS = {
  PRIVACY: 'account.reasons.PRIVACY',
  TOO_MUCH_TIME: 'account.reasons.TOO_MUCH_TIME',
  FRESH_START: 'account.reasons.FRESH_START',
  NOT_USEFUL: 'account.reasons.NOT_USEFUL',
  TECH_ISSUES: 'account.reasons.TECH_ISSUES',
  OTHER: 'account.reasons.OTHER',
} as const satisfies Record<DeleteReason, string>

export const DELETE_REASON_OPTIONS = (
  [
    'PRIVACY',
    'TOO_MUCH_TIME',
    'FRESH_START',
    'NOT_USEFUL',
    'TECH_ISSUES',
    'OTHER',
  ] as const
).map(value => ({ value, labelKey: DELETE_REASON_LABEL_KEYS[value] }))

// Monta a string final enviada ao backend: o texto livre quando 'OTHER', senão o
// próprio value (token estável). Retorna undefined quando não há motivo utilizável.
export function buildReason(
  reason: DeleteReason | null,
  otherText: string,
): string | undefined {
  if (!reason) return undefined
  if (reason === 'OTHER') return otherText.trim() || undefined
  return reason
}
