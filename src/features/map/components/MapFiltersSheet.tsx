import { View, Text, Pressable, ScrollView, Switch } from 'react-native'
import { SheetModal } from '@/shared/components/SheetModal'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { EventStatusFilter } from '@/features/events/components/EventStatusFilter'
import { useMapUiStore } from '../store/mapUiStore'
import { isDefaultMapFilters } from '../types'
import { colors } from '@/shared/theme'

// Menu de filtros do mapa (aberto pelo botão no GlobalHeader). Aplica ao vivo na
// store — o mapa reage na hora. Escala somando seções aqui + campo em MapFilters.
export function MapFiltersSheet() {
  const open = useMapUiStore(s => s.filtersOpen)
  const setOpen = useMapUiStore(s => s.setFiltersOpen)
  const filters = useMapUiStore(s => s.filters)
  const setFilters = useMapUiStore(s => s.setFilters)
  const reset = useMapUiStore(s => s.resetFilters)

  return (
    <SheetModal visible={open} onClose={() => setOpen(false)}>
      <ScrollView
        className="px-4 max-h-[480px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-content text-lg font-bold">Filtros</Text>
          {!isDefaultMapFilters(filters) && (
            <Pressable
              onPress={reset}
              hitSlop={8}
              accessibilityLabel="Limpar filtros"
            >
              <Text className="text-brand-text text-sm font-medium">
                Limpar
              </Text>
            </Pressable>
          )}
        </View>

        <Text className="text-content-muted text-sm font-semibold mt-3 mb-2">
          Status
        </Text>
        <EventStatusFilter
          value={filters.statuses}
          onChange={statuses => setFilters({ ...filters, statuses })}
        />

        <Text className="text-content-muted text-sm font-semibold mt-5 mb-2">
          Categorias
        </Text>
        <CategoryMultiSelect
          value={filters.categories}
          onChange={categories => setFilters({ ...filters, categories })}
        />

        <View className="flex-row items-center justify-between mt-6 mb-1">
          <View className="flex-1 pr-3">
            <Text className="text-content text-base font-medium">
              Apenas amigos
            </Text>
            <Text className="text-content-subtle text-xs">
              Eventos de quem você segue ou com presença de amigos
            </Text>
          </View>
          <Switch
            value={filters.friendsOnly}
            onValueChange={friendsOnly =>
              setFilters({ ...filters, friendsOnly })
            }
            trackColor={{ true: colors.brand, false: colors.lineStrong }}
            thumbColor={colors.content}
          />
        </View>
      </ScrollView>
    </SheetModal>
  )
}
