import { View, Text } from 'react-native'
import { CategoryChip } from './CategoryChip'
import type { Subcategory } from '@/shared/types'

type Props = {
  title: string
  items: Subcategory[]
  selected: string[]
  onToggle: (value: string) => void
  atMax?: boolean
}

// Grupo rotulado de chips selecionáveis — base dos seletores de interesses.
// Some quando não há itens (ex.: categoria sem subcategorias).
export function InterestGroup({
  title,
  items,
  selected,
  onToggle,
  atMax,
}: Props) {
  if (items.length === 0) return null

  return (
    <View className="gap-2">
      <Text className="text-xs font-medium text-content-subtle">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {items.map(item => {
          const active = selected.includes(item.value)
          return (
            <CategoryChip
              key={item.value}
              label={item.label}
              active={active}
              onPress={() => onToggle(item.value)}
              disabled={!active && !!atMax}
            />
          )
        })}
      </View>
    </View>
  )
}
