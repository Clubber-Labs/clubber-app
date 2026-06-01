import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Inbox: agora(<1min) / 12:30 (hoje) / ontem / seg (esta semana) / 12/05 / 12/05/2024.
export function formatInboxTime(iso: string): string {
  const date = new Date(iso)
  if (isToday(date)) {
    const diffMs = Date.now() - date.getTime()
    if (diffMs < 60_000) return 'agora'
    return format(date, 'HH:mm')
  }
  if (isYesterday(date)) return 'ontem'
  if (isThisWeek(date, { locale: ptBR })) return format(date, 'EEE', { locale: ptBR })
  if (isThisYear(date)) return format(date, 'dd/MM')
  return format(date, 'dd/MM/yyyy')
}

// Hora da bolha.
export function formatMessageTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

// Separador de data dentro da conversa.
export function dateSeparatorLabel(iso: string): string {
  const date = new Date(iso)
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  if (isThisYear(date)) return format(date, "d 'de' MMMM", { locale: ptBR })
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}
