import { View, ActivityIndicator } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'
import { CategoryChip } from './CategoryChip'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function CategorySingleSelect({ value, onChange }: Props) {
  const { categories, isLoading } = useCategories()

  if (isLoading && categories.length === 0) {
    return <ActivityIndicator size="small" color="#8b5cf6" className="self-start" />
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {categories.map(category => (
        <CategoryChip
          key={category.value}
          label={category.label}
          active={value === category.value}
          onPress={() => onChange(category.value)}
        />
      ))}
    </View>
  )
}
