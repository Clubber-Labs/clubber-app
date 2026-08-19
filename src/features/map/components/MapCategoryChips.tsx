import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useCategories } from '@/shared/hooks/useCategories'
import { Chip } from '@/shared/components/Chip'
import { useMapUiStore } from '../store/mapUiStore'
import { categoryHue } from '@/shared/theme'
import type { MapKind } from '../types'

// Chips sobre o mapa: tipo (eventos × rolês, mutuamente exclusivos — reativar
// volta pra "tudo") + categorias multi-select, sincronizados com o mesmo
// estado do sheet de filtros (mapUiStore.filters). "Todas" limpa a seleção
// de categorias (sem categoria = todas).
export function MapCategoryChips() {
  const { t } = useTranslation()
  const { categories } = useCategories()
  const filters = useMapUiStore(s => s.filters)
  const setFilters = useMapUiStore(s => s.setFilters)
  const selected = filters.categories

  function toggleKind(next: Exclude<MapKind, 'all'>) {
    setFilters({ ...filters, kind: filters.kind === next ? 'all' : next })
  }

  function toggle(value: string) {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    setFilters({ ...filters, categories: next })
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
    >
      <Chip
        label={t('map.chips.events')}
        active={filters.kind === 'events'}
        onPress={() => toggleKind('events')}
      />
      <Chip
        label={t('map.chips.spots')}
        active={filters.kind === 'spots'}
        onPress={() => toggleKind('spots')}
      />
      {categories.length > 0 && (
        <>
          <View className="w-px self-stretch my-1 bg-white/20" />
          <Chip
            label={t('map.chips.all')}
            active={selected.length === 0}
            onPress={() => setFilters({ ...filters, categories: [] })}
          />
          {categories.map(category => {
            const hue = categoryHue(category.value)
            return (
              <Chip
                key={category.value}
                label={category.label}
                active={selected.includes(category.value)}
                onPress={() => toggle(category.value)}
                activeColors={{
                  bg: hue.chipBg,
                  border: hue.chipBorder,
                  text: hue.chipText,
                }}
              />
            )
          })}
        </>
      )}
    </ScrollView>
  )
}
