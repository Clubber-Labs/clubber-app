import { View, Text } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import type { EventStatus } from '@/shared/types'
import { SPECTRUM } from '@/shared/theme'

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

// Selo do "agora": fundo no gradiente do espectro (SVG — sem dependência de
// gradiente nativo) + ponto branco, texto sempre claro.
function LiveBadge() {
  return (
    <View className="relative overflow-hidden rounded-md">
      <Svg
        width="100%"
        height="100%"
        style={{ position: 'absolute' }}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="live-badge" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={SPECTRUM[0]} />
            <Stop offset="0.5" stopColor={SPECTRUM[1]} />
            <Stop offset="1" stopColor={SPECTRUM[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#live-badge)" />
      </Svg>
      <View className="flex-row items-center gap-1.5 px-2.5 py-1">
        <View className="w-1.5 h-1.5 rounded-full bg-content" />
        <Text className="text-xs font-bold text-content">
          {buildLabel('ONGOING')}
        </Text>
      </View>
    </View>
  )
}

// `status` vem sempre do backend — mobile não computa. Quando ausente ou
// desconhecido, não renderiza (forward-compat enquanto o backend popula).
export function EventStatusBadge({ status, date }: Props) {
  if (!status) return null
  if (status === 'ONGOING') return <LiveBadge />
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
