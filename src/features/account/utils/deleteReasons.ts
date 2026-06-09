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

export const DELETE_REASON_LABELS: Record<DeleteReason, string> = {
  PRIVACY: 'Preocupação com privacidade',
  TOO_MUCH_TIME: 'Passo tempo demais aqui',
  FRESH_START: 'Quero recomeçar do zero',
  NOT_USEFUL: 'Não acho o app útil',
  TECH_ISSUES: 'Problemas técnicos',
  OTHER: 'Outro',
}

export const DELETE_REASON_OPTIONS: { value: DeleteReason; label: string }[] = (
  [
    'PRIVACY',
    'TOO_MUCH_TIME',
    'FRESH_START',
    'NOT_USEFUL',
    'TECH_ISSUES',
    'OTHER',
  ] as const
).map(value => ({ value, label: DELETE_REASON_LABELS[value] }))

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
