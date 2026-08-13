/**
 * Um campo obrigatório está preenchido? Usado pra travar botões de ação antes
 * do submit. Booleano só conta como preenchido quando true — os obrigatórios
 * desse tipo são aceites (termos, consentimentos).
 */
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function areFilled(values: readonly unknown[]): boolean {
  return values.every(isFilled)
}
