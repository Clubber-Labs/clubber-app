import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// "visto por último há 5 minutos". Espelha o formatRelative de shared/utils, mas
// com prefixo próprio do chat. Pura. Guarda data inválida (formatDistanceToNow
// lança RangeError com Date inválido) — isto roda em render, então degrada pra ''.
export function lastSeenLabel(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return ''
  const date = new Date(lastSeenAt)
  if (Number.isNaN(date.getTime())) return ''
  const distance = formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
  return `visto ${distance}`
}
