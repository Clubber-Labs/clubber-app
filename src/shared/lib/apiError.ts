import { isAxiosError } from 'axios'

export type ApiErrorData = {
  message: string
  statusCode?: number
  /**
   * Campo que causou o erro, quando o backend o declara — hoje só o 409 do
   * `POST /users` ('username' | 'email'). Sem tipo fechado de propósito: é dado
   * de rede, e quem consome decide o que reconhece (ver resolveConflictField).
   */
  field?: string
}

export function getApiError(error: unknown): ApiErrorData {
  if (isAxiosError(error) && error.response?.data?.message) {
    const { field } = error.response.data
    return {
      message: error.response.data.message,
      statusCode: error.response.status,
      ...(typeof field === 'string' ? { field } : {}),
    }
  }
  return { message: 'Algo deu errado. Tente novamente.' }
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
