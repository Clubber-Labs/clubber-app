import { isAxiosError } from 'axios'
import { i18n } from '@/shared/i18n'

// Fallbacks por status quando o backend não manda {message}. A semântica vem
// do contrato: 400 = sem preferências de rolê (ou sem lugar correspondente),
// 401 = sessão (o interceptor já tenta refresh/desloga; isto cobre o transitório),
// 429 = quota diária, 502/503 = busca de locais fora do ar.
const FALLBACK_KEYS = {
  400: 'spots.generateErrors.noPreferences',
  401: 'spots.generateErrors.sessionExpired',
  429: 'spots.generateErrors.dailyLimit',
  502: 'spots.generateErrors.placesDown',
  503: 'spots.generateErrors.placesDown',
} as const

const GENERIC_KEY = 'spots.generateErrors.generic'

function fallbackKey(status: number) {
  return status in FALLBACK_KEYS
    ? FALLBACK_KEYS[status as keyof typeof FALLBACK_KEYS]
    : GENERIC_KEY
}

export function suggestionsErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    const backendMessage = error.response.data?.message
    if (typeof backendMessage === 'string' && backendMessage) {
      return backendMessage
    }
    return i18n.t(fallbackKey(error.response.status))
  }
  return i18n.t(GENERIC_KEY)
}
