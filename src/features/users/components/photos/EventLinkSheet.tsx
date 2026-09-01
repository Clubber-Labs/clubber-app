import { useMemo } from 'react'
import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckIcon } from 'phosphor-react-native'
import { SheetModal } from '@/shared/components/SheetModal'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatShortDate } from '@/shared/utils/dateFormat'
import { useUserEvents } from '../../hooks/useUserEvents'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

export type LinkedEvent = { id: string; title: string }

type Props = {
  visible: boolean
  userId: string
  selected: LinkedEvent | null
  onSelect: (event: LinkedEvent | null) => void
  onClose: () => void
}

// Só o que já aconteceu (ou está acontecendo): a foto é registro de presença,
// não convite. O status vem calculado do backend — nunca derivado da data.
function attended(event: UserEventSummary): boolean {
  return event.status === 'PAST' || event.status === 'ONGOING'
}

export function EventLinkSheet({
  visible,
  userId,
  selected,
  onSelect,
  onClose,
}: Props) {
  const { t } = useTranslation()
  const { height } = useWindowDimensions()
  const locale = useLocale()
  const query = useUserEvents(userId, visible)
  const events = useMemo(
    () => (query.data?.pages.flatMap(p => p.data) ?? []).filter(attended),
    [query.data],
  )

  function choose(event: LinkedEvent | null) {
    onSelect(event)
    onClose()
  }

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      height={Math.round(height * 0.6)}
    >
      <View className="flex-1 px-5">
        <Text className="text-[17px] font-extrabold text-content">
          {t('profile.photo.linkEvent')}
        </Text>
        <FlatList
          className="mt-2 flex-1"
          data={events}
          keyExtractor={event => event.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Row
              title={t('profile.photo.linkNone')}
              active={selected === null}
              onPress={() => choose(null)}
            />
          }
          ListEmptyComponent={
            query.isLoading ? null : (
              <Text className="py-4 text-sm text-content-muted">
                {t('profile.photo.linkEmpty')}
              </Text>
            )
          }
          renderItem={({ item }) => (
            <Row
              title={item.title}
              subtitle={formatShortDate(
                item.date,
                locale,
                item.timezone ?? undefined,
              )}
              active={selected?.id === item.id}
              onPress={() => choose({ id: item.id, title: item.title })}
            />
          )}
          onEndReached={() => query.hasNextPage && query.fetchNextPage()}
          onEndReachedThreshold={0.4}
        />
      </View>
    </SheetModal>
  )
}

function Row({
  title,
  subtitle,
  active,
  onPress,
}: {
  title: string
  subtitle?: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="min-h-[52px] flex-row items-center gap-3 border-b border-line py-3"
    >
      <View className="flex-1">
        <Text
          className={`text-[15px] ${active ? 'font-bold text-content' : 'text-content-secondary'}`}
          numberOfLines={1}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text className="mt-0.5 text-xs text-content-muted">{subtitle}</Text>
        )}
      </View>
      {active && <CheckIcon size={16} weight="bold" color={colors.content} />}
    </Pressable>
  )
}
