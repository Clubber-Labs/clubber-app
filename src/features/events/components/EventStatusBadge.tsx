import { View, Text } from 'react-native'
import { LivePill } from '@/shared/components/LivePill'
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

// ONGOING não está aqui: é o único estado que usa o espectro-assinatura
// (gradiente do "agora"), renderizado à parte.
const STYLES: Record<Exclude<EventStatus, 'ONGOING'>, Style> = {
  SOON: { bg: 'bg-warning-surface', text: 'text-warning-text' },
  UPCOMING: { bg: 'bg-surface-elevated', text: 'text-content-secondary' },
  PAST: { bg: 'bg-surface-elevated/60', text: 'text-content-subtle' },
  CANCELED: {
    bg: 'bg-surface-elevated',
    text: 'text-content-subtle',
    strike: true,
  },
}

function buildLabel(status: EventStatus, date?: string): string {
  if (status === 'ONGOING') return 'Rolando agora'
  if (status === 'SOON') return 'Em breve'
  if (status === 'PAST') return 'Encerrado'
  if (status === 'CANCELED') return 'Cancelado'
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

// `status` vem sempre do backend — mobile não computa. Quando ausente ou
// desconhecido, não renderiza (forward-compat enquanto o backend popula).
export function EventStatusBadge({ status, date }: Props) {
  if (!status) return null
  if (status === 'ONGOING') return <LivePill label={buildLabel('ONGOING')} />
  // hasOwn evita match em chaves herdadas (ex: 'toString')
  if (!Object.hasOwn(STYLES, status)) return null
  const style = STYLES[status]
  return (
    <View className={`px-2.5 py-1 rounded-md ${style.bg}`}>
      <Text
        className={`text-xs font-semibold ${style.text} ${style.strike ? 'line-through' : ''}`}
      >
        {buildLabel(status, date)}
      </Text>
    </View>
  )
}
