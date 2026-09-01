import { memo, useCallback, type ComponentProps } from 'react'
import type { ListRenderItem } from 'react-native'
import { View, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  GestureDetector,
  type NativeGesture,
} from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { ProfileSectionHeader } from './ProfileSectionHeader'
import { ProfileEventTile } from './ProfileEventTile'
import { ProfileEventsSkeleton } from './ProfileEventsSkeleton'
import { ProfileEventsEmpty } from './ProfileEventsEmpty'
import type { StageList } from './ProfileStage'
import { STAGE_SECTION_GAP } from '../utils/profileStage'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  events: StageList<UserEventSummary>
  // Dono do perfil — o tile assina os eventos que não são dele.
  ownerId: string
  isOwnProfile: boolean
  scrollEnabled: boolean
  native: NativeGesture
  onScroll: ComponentProps<typeof Animated.FlatList>['onScroll']
  onCreate?: () => void
  bottomPadding: number
}

type Spacer = { __spacer: string }
type Row = UserEventSummary | Spacer

function isSpacer(row: Row): row is Spacer {
  return '__spacer' in row
}

// Vitrine de eventos (tiles do design 8a) em duas colunas. Vive no palco do
// perfil: no resumo só a primeira fileira aparece; expandida, rola sozinha.
export const ProfileEventsSection = memo(function ProfileEventsSection({
  events,
  ownerId,
  isOwnProfile,
  scrollEnabled,
  native,
  onScroll,
  onCreate,
  bottomPadding,
}: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  // numColumns=2: completa a linha ímpar com um espaçador pra os tiles (flex-1)
  // manterem largura igual sem o último esticar pra largura cheia.
  const rows: Row[] =
    events.items.length % 2
      ? [...events.items, { __spacer: 'spacer' }]
      : events.items

  const openEvent = useCallback(
    (event: UserEventSummary) => router.push(`/events/${event.id}`),
    [router],
  )
  const renderItem = useCallback<ListRenderItem<Row>>(
    ({ item }) =>
      isSpacer(item) ? (
        <View className="flex-1" />
      ) : (
        <ProfileEventTile event={item} ownerId={ownerId} onPress={openEvent} />
      ),
    [ownerId, openEvent],
  )

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: STAGE_SECTION_GAP }}
    >
      <ProfileSectionHeader
        title={t('profile.eventsSection')}
        count={events.totalCount}
      />
      <GestureDetector gesture={native}>
        <Animated.FlatList
          data={rows}
          numColumns={2}
          keyExtractor={item => (isSpacer(item) ? item.__spacer : item.id)}
          scrollEnabled={scrollEnabled}
          bounces={false}
          overScrollMode="never"
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          columnWrapperStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={renderItem}
          ListEmptyComponent={
            events.isLoading ? (
              <ProfileEventsSkeleton />
            ) : (
              <ProfileEventsEmpty
                variant={isOwnProfile ? 'own' : 'other'}
                onCreate={onCreate}
              />
            )
          }
          ListFooterComponent={
            events.isFetchingNextPage ? (
              <ActivityIndicator
                color={colors.brand}
                style={{ marginTop: 16 }}
              />
            ) : null
          }
          onEndReached={() =>
            scrollEnabled && events.hasNextPage && events.onLoadMore()
          }
          onEndReachedThreshold={0.3}
        />
      </GestureDetector>
    </View>
  )
})
