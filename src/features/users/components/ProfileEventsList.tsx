import type { ReactElement } from 'react'
import { View, FlatList, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { ProfileEventTile } from './ProfileEventTile'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  events: UserEventSummary[]
  header: ReactElement
  empty: ReactElement
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

type Spacer = { __spacer: string }
type Row = UserEventSummary | Spacer

function isSpacer(row: Row): row is Spacer {
  return '__spacer' in row
}

export function ProfileEventsList({
  events,
  header,
  empty,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) {
  const router = useRouter()

  // numColumns=2: completa a linha ímpar com um espaçador pra os tiles (flex-1)
  // manterem largura igual sem o último esticar pra largura cheia.
  const data: Row[] =
    events.length % 2 ? [...events, { __spacer: 'spacer' }] : events

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={item => (isSpacer(item) ? item.__spacer : item.id)}
      contentContainerStyle={{ paddingBottom: 32 }}
      columnWrapperStyle={{ paddingHorizontal: 16, gap: 8 }}
      ListHeaderComponent={header}
      renderItem={({ item }) =>
        isSpacer(item) ? (
          <View className="flex-1" />
        ) : (
          <ProfileEventTile
            event={item}
            onPress={() => router.push(`/events/${item.id}`)}
          />
        )
      }
      ListEmptyComponent={empty}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 16 }} />
        ) : null
      }
      onEndReached={() => hasNextPage && onLoadMore()}
      onEndReachedThreshold={0.3}
    />
  )
}
