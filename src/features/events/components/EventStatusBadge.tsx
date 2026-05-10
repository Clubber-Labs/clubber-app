import { View, Text } from 'react-native'
import type { EventStatus } from '@/shared/types'

type Props = {
  status: EventStatus | null | undefined
  date?: string
}

type Style = {
  bg: string
  text: string
  strike?: boolean
}

const STYLES: Record<EventStatus, Style> = {
  ONGOING: { bg: 'bg-red-900', text: 'text-red-200' },
  SOON: { bg: 'bg-amber-900', text: 'text-amber-200' },
  UPCOMING: { bg: 'bg-zinc-800', text: 'text-zinc-200' },
  PAST: { bg: 'bg-zinc-800/60', text: 'text-zinc-500' },
  CANCELED: { bg: 'bg-zinc-800', text: 'text-zinc-500', strike: true },
}

function buildLabel(status: EventStatus, date?: string): string {
  if (status === 'ONGOING') return 'Acontecendo agora'
  if (status === 'SOON') return 'Em breve'
  if (status === 'PAST') return 'Encerrado'
  if (status === 'CANCELED') return 'Cancelado'
  // UPCOMING: usa o `date` pra dar contexto temporal quando disponível
  if (!date) return 'Em breve'
  const days = daysUntil(date)
  if (days <= 0) return 'Em breve'
  if (days === 1) return 'Amanhã'
  return `Em ${days} dias`
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

/**
 * Badge visual do ciclo de vida do evento. `status` vem sempre do backend —
 * mobile NUNCA computa. Quando ausente (backend ainda não populou ou status
 * desconhecido), o componente não renderiza nada — comportamento neutro
 * preserva forward compat enquanto o backend implementa o campo.
 */
export function EventStatusBadge({ status, date }: Props) {
  if (!status || !(status in STYLES)) return null
  const style = STYLES[status]
  return (
    <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
      <Text
        className={`text-xs font-semibold ${style.text} ${style.strike ? 'line-through' : ''}`}
      >
        {buildLabel(status, date)}
      </Text>
    </View>
  )
}
