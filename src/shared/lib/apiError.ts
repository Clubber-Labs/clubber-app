import { isAxiosError } from 'axios'

export type ApiErrorData = {
  message: string
  statusCode?: number
}

export function getApiError(error: unknown): ApiErrorData {
  if (isAxiosError(error) && error.response?.data?.message) {
    return {
      message: error.response.data.message,
      statusCode: error.response.status,
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
