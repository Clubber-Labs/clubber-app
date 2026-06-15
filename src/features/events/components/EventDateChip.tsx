import { View, Text } from 'react-native'

type Props = {
  date: string
  // Eventos passados/cancelados perdem o destaque da marca no mês.
  muted?: boolean
  // Versão menor para tiles densos (grade do perfil).
  compact?: boolean
}

function parts(iso: string): { month: string; day: string } {
  const d = new Date(iso)
  const month = d
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
  return { month, day: String(d.getDate()) }
}

export function EventDateChip({ date, muted = false, compact = false }: Props) {
  const { month, day } = parts(date)
  return (
    <View
      className={`overflow-hidden rounded-lg border border-white/15 bg-black/70 ${
        compact ? 'w-10' : 'w-12'
      }`}
    >
      <Text
        className={`py-0.5 text-center font-extrabold tracking-wider text-content ${
          compact ? 'text-[9px]' : 'text-[10px]'
        } ${muted ? 'bg-surface-higher' : 'bg-brand'}`}
      >
        {month}
      </Text>
      <Text
        className={`py-1 text-center font-extrabold leading-none text-content ${
          compact ? 'text-base' : 'text-lg'
        }`}
      >
        {day}
      </Text>
    </View>
  )
}
