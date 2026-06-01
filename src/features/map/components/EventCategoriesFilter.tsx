import { ScrollView, Pressable, Text } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'
import { ALL_CATEGORIES } from '../constants'

type Props = {
  // Values do enum (mais o sentinel ALL_CATEGORIES). A seleção continua por
  // value; só a exibição usa o rótulo localizado de /categories.
  categories: string[]
  active: string
  onChange: (category: string) => void
}

export function EventCategoriesFilter({ categories, active, onChange }: Props) {
  const { labelFor } = useCategories()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
    >
      {categories.map(category => {
        const isActive = active === category
        const label =
          category === ALL_CATEGORIES ? 'Todas' : labelFor(category)
        return (
          <Pressable
            key={category}
            onPress={() => onChange(category)}
            className={`px-4 py-2 rounded-full border ${
              isActive
                ? 'bg-violet-600 border-violet-600'
                : 'bg-zinc-900/90 border-zinc-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-zinc-200'}`}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
