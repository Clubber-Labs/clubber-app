import { View, Text } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'

type Props = {
  value: string
}

// Pílula violeta com o rótulo localizado da categoria. Substitui qualquer
// renderização de `event.category` cru (que mostraria o enum, ex.: 'PARTY').
export function CategoryBadge({ value }: Props) {
  const { labelFor } = useCategories()
  return (
    <View className="bg-violet-950 px-2 py-1 rounded-full">
      <Text className="text-violet-300 text-xs font-semibold">
        {labelFor(value)}
      </Text>
    </View>
  )
}
