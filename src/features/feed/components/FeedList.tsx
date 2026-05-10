import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useFeed } from '../hooks/useFeed'
import { EventCard } from '@/features/events/components/EventCard'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import type { FeedEvent } from '@/shared/types'

export function FeedList() {
  const router = useRouter()
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFeed()
  const { refreshing, onRefresh } = usePullRefresh(refetch)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-zinc-400 text-center">
          Erro ao carregar o feed.
        </Text>
      </View>
    )
  }

  const events = data?.pages.flatMap(page => page.data) ?? []

  if (events.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white font-semibold text-base mb-1">
          Nada por aqui ainda
        </Text>
        <Text className="text-zinc-400 text-center text-sm">
          Siga pessoas para ver os eventos delas no seu feed.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item: FeedEvent) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <EventCard
          event={item}
          onPress={() => router.push(`/events/${item.id}`)}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#8b5cf6"
        />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" color="#8b5cf6" className="py-4" />
        ) : null
      }
    />
  )
}
