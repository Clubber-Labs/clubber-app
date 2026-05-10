import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR })
}

export function formatEventDate(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
}

export function formatShortDate(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR })
}

// `new Date('YYYY-MM-DD')` é interpretado como UTC; em fusos negativos vira
// o dia anterior no horário local. Use estes helpers pra campos date-only.
export function parseLocalDate(iso: string): Date {
  const [datePart] = iso.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
