import { ScrollView, Pressable, Text } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'
import { useMapUiStore } from '../store/mapUiStore'

// Chips de categoria sobre o mapa — filtro rápido multi-select sincronizado com
// o mesmo estado do sheet de filtros (mapUiStore.filters.categories). "Todas"
// limpa a seleção (sem categoria = todas).
export function MapCategoryChips() {
  const { categories } = useCategories()
  const filters = useMapUiStore(s => s.filters)
  const setFilters = useMapUiStore(s => s.setFilters)
  const selected = filters.categories

  function toggle(value: string) {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    setFilters({ ...filters, categories: next })
  }

  if (categories.length === 0) return null

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
    >
      <Chip
        label="Todas"
        active={selected.length === 0}
        onPress={() => setFilters({ ...filters, categories: [] })}
      />
      {categories.map(category => (
        <Chip
          key={category.value}
          label={category.label}
          active={selected.includes(category.value)}
          onPress={() => toggle(category.value)}
        />
      ))}
    </ScrollView>
  )
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`rounded-lg border px-3 py-2 ${
        active ? 'border-brand bg-brand' : 'border-line-strong bg-surface/95'
      }`}
    >
      <Text
        className={`text-xs font-bold ${active ? 'text-content' : 'text-content-secondary'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
