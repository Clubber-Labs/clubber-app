import { View, Text } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'

type Props = {
  value: string
}

// Pílula violeta com o rótulo localizado de uma categoria. Um evento pode ter
// várias — o pai mapeia `event.categories` renderizando uma pílula por valor.
export function CategoryBadge({ value }: Props) {
  const { labelFor } = useCategories()
  return (
    <View className="bg-brand-surface px-2.5 py-1 rounded-md">
      <Text className="text-brand-text-strong text-xs font-semibold">
        {labelFor(value)}
      </Text>
    </View>
  )
}
