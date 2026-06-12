import { isAxiosError } from 'axios'

// Fallbacks por status quando o backend não manda {message}. A semântica vem
// do contrato: 400 = sem preferências de rolê (ou sem lugar correspondente),
// 429 = quota diária, 503 = busca de locais fora do ar.
const FALLBACKS: Record<number, string> = {
  400: 'Configure suas preferências de rolê no perfil para receber sugestões.',
  429: 'Você atingiu o limite diário de sugestões. Tente de novo amanhã.',
  503: 'A busca de lugares está indisponível agora. Tente em instantes.',
}

export function suggestionsErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    const backendMessage = error.response.data?.message
    if (typeof backendMessage === 'string' && backendMessage) {
      return backendMessage
    }
    return (
      FALLBACKS[error.response.status] ??
      'Não foi possível gerar sugestões. Tente novamente.'
    )
  }
  return 'Não foi possível gerar sugestões. Tente novamente.'
}
