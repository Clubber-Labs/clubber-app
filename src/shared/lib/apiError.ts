import { isAxiosError } from 'axios'
import { i18n } from '@/shared/i18n'
import { TRANSLATED_ERROR_CODES, ZOD_ISSUE_CODES } from './errorCodes'
import type { TranslatedErrorCode, ZodIssueCode } from './errorCodes'

export type ValidationIssue = {
  /** Campo que falhou, já sem o prefixo de path do Fastify ('' na raiz). */
  field: string
  /** Keyword nativa do Zod: too_small, invalid_type... */
  code: string
}

export type ApiErrorData = {
  /** Código do vocabulário fechado do backend, ou 'INTERNAL_ERROR' se ausente. */
  code: string
  /**
   * Texto JÁ TRADUZIDO, pronto pra tela. Nunca é o `message` do servidor: lá ele
   * é ora o próprio código ('EMAIL_TAKEN'), ora uma frase inglesa crua de plugin
   * do Fastify — serve pra log, nunca é copy de produto.
   */
  message: string
  statusCode?: number
  /** Input que causou o erro, quando o backend o declara. Dirige borda e foco. */
  field?: string
  issues?: ValidationIssue[]
}

type ErrorBody = {
  code?: unknown
  field?: unknown
  params?: unknown
  issues?: unknown
}

function isTranslated(code: string): code is TranslatedErrorCode {
  return (TRANSLATED_ERROR_CODES as readonly string[]).includes(code)
}

function isZodIssueCode(code: string): code is ZodIssueCode {
  return (ZOD_ISSUE_CODES as readonly string[]).includes(code)
}

// Só string e número entram na interpolação: o backend declara `params` como
// Record<string, string | number>, e qualquer outra coisa viraria "[object
// Object]" no meio da frase.
function readParams(value: unknown): Record<string, string | number> {
  if (!value || typeof value !== 'object') return {}
  const out: Record<string, string | number> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' || typeof item === 'number') out[key] = item
  }
  return out
}

// `instancePath` do Fastify vem como '/username' ou '/body/username'; o que
// interessa pro foco é a última parte.
function fieldFromPath(path: unknown): string {
  if (typeof path !== 'string') return ''
  const parts = path.split('/').filter(Boolean)
  return parts.length ? parts[parts.length - 1] : ''
}

function readIssues(value: unknown): ValidationIssue[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const { path, code } = item as { path?: unknown; code?: unknown }
    return [
      {
        field: fieldFromPath(path),
        code: typeof code === 'string' ? code : '',
      },
    ]
  })
}

function translate(
  code: string,
  params: Record<string, string | number>,
  issues: ValidationIssue[],
  statusCode?: number,
): string {
  if (code === 'VALIDATION_ERROR') {
    const first = issues[0]?.code ?? ''
    return isZodIssueCode(first)
      ? i18n.t(`errors.validation.${first}`)
      : i18n.t('errors.validation.default')
  }
  if (isTranslated(code)) return i18n.t(`errors.${code}`, params)
  // Rate limit e afins chegam com código FST_* do plugin, fora do nosso
  // vocabulário — o status é o único sinal utilizável.
  if (statusCode === 429) return i18n.t('errors.tooManyRequests')
  return i18n.t('errors.default')
}

export function getApiError(error: unknown): ApiErrorData {
  if (!isAxiosError(error)) {
    return { code: 'INTERNAL_ERROR', message: i18n.t('errors.default') }
  }
  // Sem response = requisição nunca chegou (offline, DNS, timeout).
  if (!error.response) {
    return { code: 'NETWORK_ERROR', message: i18n.t('errors.network') }
  }

  const body = (error.response.data ?? {}) as ErrorBody
  const code = typeof body.code === 'string' ? body.code : 'INTERNAL_ERROR'
  const field = typeof body.field === 'string' ? body.field : undefined
  const issues = readIssues(body.issues)
  const statusCode = error.response.status

  return {
    code,
    message: translate(code, readParams(body.params), issues, statusCode),
    statusCode,
    ...(field ? { field } : {}),
    ...(issues.length ? { issues } : {}),
  }
}

export function isConflictError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 409
}

export function isValidationError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 400
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}

export function isForbiddenError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403
}

export function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404
}

export function isTooManyRequestsError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 429
}
