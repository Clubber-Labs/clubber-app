import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Janela do spot num texto só: "11 de junho às 19:00 – 22:00" quando começa e
// termina no mesmo dia; senão repete a data no fim.
export function formatSpotWindow(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const startText = format(start, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
  const endText = isSameDay(start, end)
    ? format(end, 'HH:mm', { locale: ptBR })
    : format(end, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
  return `${startText} – ${endText}`
}

// Dentro da janela AGORA — gate do espectro-assinatura no balão do mapa.
export function isSpotLiveNow(startsAt: string, endsAt: string): boolean {
  const now = Date.now()
  return (
    new Date(startsAt).getTime() <= now && now <= new Date(endsAt).getTime()
  )
}
