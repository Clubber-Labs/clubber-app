import { getApiError, isConflictError } from '@/shared/lib/apiError'

/**
 * Descobre QUAL campo causou um 409, para acender a borda e focar o input.
 *
 * O backend declara `field` em todo conflito de identidade — inclusive nos que
 * nascem de unique constraint do Prisma, que o mapeia de volta pra coluna. Não
 * há mais match por prosa: a mensagem hoje é o próprio código, e casar palavra
 * contra a copy já traduzida só funcionaria em português.
 */
export function resolveConflictField<F extends string>(
  error: unknown,
  fields: readonly F[],
): { field: F; message: string } | null {
  if (!isConflictError(error)) return null

  const { field, message } = getApiError(error)
  if (!field || !(fields as readonly string[]).includes(field)) return null
  return { field: field as F, message }
}
