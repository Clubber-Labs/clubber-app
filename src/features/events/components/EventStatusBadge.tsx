import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
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

// Decide a CHAVE do rótulo (função pura); a tradução acontece no render, com o
// t() assinado — frase pronta aqui não re-renderizaria na troca de idioma.
type BadgeLabel =
  | { key: `events.status.${'soon' | 'past' | 'canceled' | 'tomorrow'}` }
  | { key: 'events.status.inDays'; count: number }

function buildLabel(
  status: Exclude<EventStatus, 'ONGOING'>,
  date?: string,
): BadgeLabel {
  if (status === 'SOON') return { key: 'events.status.soon' }
  if (status === 'PAST') return { key: 'events.status.past' }
  if (status === 'CANCELED') return { key: 'events.status.canceled' }
  if (!date) return { key: 'events.status.soon' }
  const days = daysUntil(date)
  if (days <= 0) return { key: 'events.status.soon' }
  if (days === 1) return { key: 'events.status.tomorrow' }
  return { key: 'events.status.inDays', count: days }
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

// `status` vem sempre do backend — mobile não computa. Quando ausente ou
// desconhecido, não renderiza (forward-compat enquanto o backend popula).
export function EventStatusBadge({ status, date }: Props) {
  const { t } = useTranslation()
  if (!status) return null
  if (status === 'ONGOING') return <LivePill />
  // hasOwn evita match em chaves herdadas (ex: 'toString')
  if (!Object.hasOwn(STYLES, status)) return null
  const style = STYLES[status]
  const label = buildLabel(status, date)
  return (
    <View className={`px-2.5 py-1 rounded-md ${style.bg}`}>
      <Text
        className={`text-xs font-semibold ${style.text} ${style.strike ? 'line-through' : ''}`}
      >
        {label.key === 'events.status.inDays'
          ? t(label.key, { count: label.count })
          : t(label.key)}
      </Text>
    </View>
  )
}
