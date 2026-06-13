import { View, ActivityIndicator } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'
import { CategoryChip } from './CategoryChip'
import { colors } from '@/shared/theme'

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  max?: number
}

export function CategoryMultiSelect({ value, onChange, max = 10 }: Props) {
  const { categories, isLoading } = useCategories()

  function toggle(categoryValue: string) {
    if (value.includes(categoryValue)) {
      onChange(value.filter(v => v !== categoryValue))
      return
    }
    if (value.length >= max) return
    onChange([...value, categoryValue])
  }

  if (isLoading && categories.length === 0) {
    return (
      <ActivityIndicator
        size="small"
        color={colors.brandEmphasis}
        className="self-start"
      />
    )
  }

  const atMax = value.length >= max

  return (
    <View className="flex-row flex-wrap gap-2">
      {categories.map(category => {
        const active = value.includes(category.value)
        return (
          <CategoryChip
            key={category.value}
            label={category.label}
            active={active}
            onPress={() => toggle(category.value)}
            disabled={!active && atMax}
          />
        )
      })}
    </View>
  )
}
