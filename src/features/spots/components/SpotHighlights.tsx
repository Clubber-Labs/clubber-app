import { View, Text } from 'react-native'

type Props = {
  // Fatos curtos do lugar (som, público, agenda, ambiente, preço). Vem do
  // backend já limitado a 5 — lista vazia não renderiza nada.
  items: string[]
  // Corte pros cards compactos, pra folha não virar parede de chips.
  max?: number
}

export function SpotHighlights({ items, max }: Props) {
  const shown = max ? items.slice(0, max) : items
  if (shown.length === 0) return null

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {shown.map(item => (
        <View
          key={item}
          className="rounded-full bg-surface-elevated border border-line px-2.5 py-1"
        >
          <Text className="text-content-tertiary text-[11px] font-semibold">
            {item}
          </Text>
        </View>
      ))}
    </View>
  )
}
