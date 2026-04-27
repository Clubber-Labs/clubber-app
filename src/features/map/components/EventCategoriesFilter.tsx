import { ScrollView, Pressable, Text } from 'react-native'

type Props = {
  categories: string[]
  active: string
  onChange: (category: string) => void
}

export function EventCategoriesFilter({ categories, active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
    >
      {categories.map(category => {
        const isActive = active === category
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
              {category}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
