import { View, Text, Pressable, ScrollView, Switch } from 'react-native'
import { useTranslation } from 'react-i18next'
import { UsersIcon } from 'phosphor-react-native'
import { SheetModal } from '@/shared/components/SheetModal'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { EventStatusFilter } from '@/features/events/components/EventStatusFilter'
import { Button } from '@/shared/components/Button'
import { useMapUiStore } from '../store/mapUiStore'
import { isDefaultMapFilters } from '../types'
import { colors } from '@/shared/theme'

const SECTION_LABEL =
  'text-content-subtle text-[11px] font-bold uppercase tracking-wider mb-2.5'

// Menu de filtros do mapa (aberto pelo botão no GlobalHeader). Aplica ao vivo na
// store — o mapa reage na hora; o CTA só fecha a folha. Escala somando seções
// aqui + campo em MapFilters.
export function MapFiltersSheet() {
  const { t } = useTranslation()
  const open = useMapUiStore(s => s.filtersOpen)
  const setOpen = useMapUiStore(s => s.setFiltersOpen)
  const filters = useMapUiStore(s => s.filters)
  const setFilters = useMapUiStore(s => s.setFilters)
  const reset = useMapUiStore(s => s.resetFilters)
  const hasActiveFilters = !isDefaultMapFilters(filters)

  return (
    <SheetModal visible={open} onClose={() => setOpen(false)}>
      <View className="px-5">
        <View className="flex-row items-center justify-between pt-1 pb-1">
          <Text className="text-content text-xl font-extrabold">
            {t('map.filters.title')}
          </Text>
          {hasActiveFilters && (
            <Pressable
              onPress={reset}
              hitSlop={8}
              accessibilityLabel={t('map.filters.clearAll')}
            >
              <Text className="text-brand-text text-[13px] font-bold">
                {t('map.filters.clear')}
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          className="max-h-[420px]"
          showsVerticalScrollIndicator={false}
        >
          <Text className={`${SECTION_LABEL} mt-4`}>
            {t('map.filters.status')}
          </Text>
          <EventStatusFilter
            wrap
            value={filters.statuses}
            onChange={statuses => setFilters({ ...filters, statuses })}
          />

          <Text className={`${SECTION_LABEL} mt-6`}>
            {t('map.filters.categories')}
          </Text>
          <CategoryMultiSelect
            value={filters.categories}
            onChange={categories => setFilters({ ...filters, categories })}
          />

          <Text className={`${SECTION_LABEL} mt-6`}>
            {t('map.filters.people')}
          </Text>
          <View className="flex-row items-center gap-3 bg-surface border border-line rounded-2xl px-3.5 py-3">
            <View className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-surface-strong items-center justify-center">
              <UsersIcon size={20} color={colors.brandText} weight="fill" />
            </View>
            <View className="flex-1">
              <Text className="text-content-secondary text-[15px] font-semibold">
                {t('map.filters.friendsOnly')}
              </Text>
              <Text className="text-content-subtle text-xs mt-0.5">
                {t('map.filters.friendsOnlyHint')}
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

        <View className="pt-4">
          <Button
            label={t('map.filters.showEvents')}
            onPress={() => setOpen(false)}
          />
        </View>
      </View>
    </SheetModal>
  )
}
