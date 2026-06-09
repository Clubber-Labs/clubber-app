import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// "visto por último há 5 minutos". Espelha o formatRelative de shared/utils, mas
// com prefixo próprio do chat. Pura.
export function lastSeenLabel(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return ''
  const distance = formatDistanceToNow(new Date(lastSeenAt), {
    addSuffix: true,
    locale: ptBR,
  })
  return `visto ${distance}`
}
