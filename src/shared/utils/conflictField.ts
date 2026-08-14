import { getApiError, isConflictError } from '@/shared/lib/apiError'

export type ConflictFieldEntry<F extends string> = {
  keyword: string
  field: F
  message: string
}

/**
 * Descobre QUAL campo causou um 409.
 *
 * O `POST /users` diz o campo em `field`; o `PUT /users/:id` não — lá o conflito
 * nasce do tratador de unique constraint do Prisma e só existe em prosa. Por
 * isso o match por texto continua, como fallback: apagar leva o erro de volta
 * pra uma caixa genérica, sem marcar campo nem navegar pra etapa dele.
 */
export function resolveConflictField<F extends string>(
  error: unknown,
  entries: ConflictFieldEntry<F>[],
): { field: F; message: string } | null {
  if (!isConflictError(error)) return null

  const { message, field } = getApiError(error)
  const declared = field
    ? entries.find(entry => entry.field === field)
    : undefined
  if (declared) return { field: declared.field, message: declared.message }

  const lower = message.toLowerCase()
  const guessed = entries.find(entry => lower.includes(entry.keyword))
  return guessed ? { field: guessed.field, message: guessed.message } : null
}
