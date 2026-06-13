import { ScrollView, Pressable, Text } from 'react-native'
import type { EventStatus } from '@/shared/types'

type Option = {
  value: EventStatus
  label: string
}

// Ordem do mais "atual" pro mais antigo — facilita scan visual.
const OPTIONS: Option[] = [
  { value: 'ONGOING', label: 'Acontecendo' },
  { value: 'SOON', label: 'Em breve' },
  { value: 'UPCOMING', label: 'Futuros' },
  { value: 'PAST', label: 'Encerrados' },
]

type Props = {
  value: EventStatus[]
  onChange: (next: EventStatus[]) => void
}

export function EventStatusFilter({ value, onChange }: Props) {
  function toggle(status: EventStatus) {
    const next = value.includes(status)
      ? value.filter(s => s !== status)
      : [...value, status]
    // Ordena pela ordem canônica do OPTIONS pra evitar queryKeys duplicadas
    // (ex: [SOON, ONGOING] ≠ [ONGOING, SOON] no hash do react-query).
    onChange(OPTIONS.map(o => o.value).filter(s => next.includes(s)))
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
    >
      {OPTIONS.map(option => {
        const active = value.includes(option.value)
        return (
          <Pressable
            key={option.value}
            onPress={() => toggle(option.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por ${option.label}`}
            accessibilityState={{ selected: active }}
            className={`px-4 py-2 rounded-full ${active ? 'bg-brand' : 'bg-surface border border-line'}`}
          >
            <Text
              className={`text-sm font-medium ${active ? 'text-content' : 'text-content-tertiary'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
