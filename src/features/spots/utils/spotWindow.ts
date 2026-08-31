import { isSameDay } from 'date-fns'
import {
  formatDayOfMonthAtTime,
  formatTime,
  zonedDate,
} from '@/shared/utils/dateFormat'

// Janela do spot num texto só: "11 de junho às 19:00 – 22:00" quando começa e
// termina no mesmo dia; senão repete a data no fim. O spot tem lugar, então a
// hora é a de parede de lá quando o fuso vem junto.
export function formatSpotWindow(
  startsAt: string,
  endsAt: string,
  locale: string,
  timeZone?: string,
): string {
  // A comparação tem que rodar no MESMO fuso da renderização: uma janela que
  // atravessa a meia-noite só no fuso do aparelho decidiria "repetir a data" ao
  // contrário do que os dois textos mostram.
  const start = zonedDate(startsAt, timeZone)
  const end = zonedDate(endsAt, timeZone)
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

// Quanto da janela já passou (0–1) e quanto falta em minutos — barra e texto do
// countdown saem daqui. `now` entra por parâmetro pra função continuar pura: o
// relógio é do chamador, que decide de quanto em quanto tempo reavaliar.
export function spotProgress(
  startsAt: string,
  endsAt: string,
  now: number,
): { ratio: number; minutesLeft: number } {
  const start = new Date(startsAt).getTime()
  const end = new Date(endsAt).getTime()
  const span = end - start
  if (!(span > 0)) return { ratio: 1, minutesLeft: 0 }
  const elapsed = Math.min(Math.max(now - start, 0), span)
  return {
    ratio: elapsed / span,
    minutesLeft: Math.max(Math.ceil((end - now) / 60_000), 0),
  }
}
