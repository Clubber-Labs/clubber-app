import { isSameDay } from 'date-fns'
import { formatDayOfMonthAtTime, formatTime } from '@/shared/utils/dateFormat'

// Janela do spot num texto só: "11 de junho às 19:00 – 22:00" quando começa e
// termina no mesmo dia; senão repete a data no fim. O spot tem lugar, então a
// hora é a de parede de lá quando o fuso vem junto.
export function formatSpotWindow(
  startsAt: string,
  endsAt: string,
  locale: string,
  timeZone?: string,
): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const startText = formatDayOfMonthAtTime(startsAt, locale, timeZone)
  const endText = isSameDay(start, end)
    ? formatTime(endsAt, locale, timeZone)
    : formatDayOfMonthAtTime(endsAt, locale, timeZone)
  return `${startText} – ${endText}`
}

// Dentro da janela AGORA — gate do espectro-assinatura no balão do mapa.
export function isSpotLiveNow(startsAt: string, endsAt: string): boolean {
  const now = Date.now()
  return (
    new Date(startsAt).getTime() <= now && now <= new Date(endsAt).getTime()
  )
}
