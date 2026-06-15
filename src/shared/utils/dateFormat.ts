import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR })
}

export function formatEventDate(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm', { locale: ptBR })
}

export function formatShortDate(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR })
}

// dd/MM/yyyy para datas date-only (YYYY-MM-DD). Usa parse local (evita o
// off-by-one de fusos negativos, como BRT) e tolera valor ausente/inválido — a
// timeline de analytics pode vir parcial enquanto o backend está em ajuste.
export function formatDayMonthYear(isoDate: string): string {
  if (!isoDate) return ''
  const date = parseLocalDate(isoDate)
  return Number.isNaN(date.getTime())
    ? isoDate
    : format(date, 'dd/MM/yyyy', { locale: ptBR })
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
