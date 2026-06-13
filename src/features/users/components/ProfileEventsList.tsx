import type { ReactElement } from 'react'
import { Text, FlatList, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { UserEventCard } from './UserEventCard'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  events: UserEventSummary[]
  header: ReactElement
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  emptyMessage?: string
}

export function ProfileEventsList({
  events,
  header,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  emptyMessage = 'Nenhum evento ainda.',
}: Props) {
  const router = useRouter()

  return (
    <FlatList
      data={events}
      keyExtractor={item => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <UserEventCard
          event={item}
          onPress={() => router.push(`/events/${item.id}`)}
        />
      )}
      ListEmptyComponent={
        <Text className="text-content-subtle text-center mt-8">
          {emptyMessage}
        </Text>
      }
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
