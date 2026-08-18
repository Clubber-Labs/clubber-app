import { isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns'
import { i18n } from '@/shared/i18n'
import {
  dateFnsLocale,
  formatDayMonth,
  formatDayOfMonth,
  formatDayOfMonthYear,
  formatShortDate,
  formatTime,
  formatWeekday,
} from '@/shared/utils/dateFormat'

// Inbox: agora(<1min) / 12:30 (hoje) / ontem / seg (esta semana) / 12/05 / 12/05/2024.
// Conversa não tem lugar: a hora é sempre a do aparelho.
export function formatInboxTime(iso: string, locale: string): string {
  const date = new Date(iso)
  if (isToday(date)) {
    const diffMs = Date.now() - date.getTime()
    if (diffMs < 60_000) return i18n.t('format.relative.now', { lng: locale })
    return formatTime(iso, locale)
  }
  if (isYesterday(date))
    return i18n.t('format.relative.yesterday', { lng: locale })
  // O início da semana é cultural, não linguístico — vem do locale do date-fns.
  if (isThisWeek(date, { locale: dateFnsLocale(locale) }))
    return formatWeekday(iso, locale)
  if (isThisYear(date)) return formatDayMonth(iso, locale)
  return formatShortDate(iso, locale)
}

// Hora da bolha.
export function formatMessageTime(iso: string, locale: string): string {
  return formatTime(iso, locale)
}

// Separador de data dentro da conversa.
export function dateSeparatorLabel(iso: string, locale: string): string {
  const date = new Date(iso)
  if (isToday(date)) return i18n.t('format.relative.today', { lng: locale })
  if (isYesterday(date))
    return i18n.t('format.relative.yesterday', { lng: locale })
  if (isThisYear(date)) return formatDayOfMonth(iso, locale)
  return formatDayOfMonthYear(iso, locale)
}
