import { isToday, isThisWeek } from 'date-fns'
import { i18n } from '@/shared/i18n'
import { dateFnsLocale } from '@/shared/utils/dateFormat'
import type { AppNotification } from '../schemas/notificationSchema'

export type NotificationSection = { title: string; data: AppNotification[] }

// Agrupa o feed (já vem do mais novo pro mais antigo) em Hoje · Esta semana ·
// Anteriores, sobre o createdAt. Client-side: não mexe no hook de paginação.
// Buckets vazios somem (só entram seções com itens).
export function groupNotificationsByDay(
  items: AppNotification[],
  locale: string,
): NotificationSection[] {
  const today: AppNotification[] = []
  const week: AppNotification[] = []
  const older: AppNotification[] = []

  for (const item of items) {
    const date = new Date(item.createdAt)
    if (isToday(date)) today.push(item)
    // O início da semana é cultural: segunda em pt/es, domingo em en. Vem do
    // locale do date-fns em vez do weekStartsOn fixo que estava aqui.
    else if (isThisWeek(date, { locale: dateFnsLocale(locale) }))
      week.push(item)
    else older.push(item)
  }

  return [
    {
      title: i18n.t('notifications.sections.today', { lng: locale }),
      data: today,
    },
    {
      title: i18n.t('notifications.sections.thisWeek', { lng: locale }),
      data: week,
    },
    {
      title: i18n.t('notifications.sections.older', { lng: locale }),
      data: older,
    },
  ].filter(section => section.data.length > 0)
}
