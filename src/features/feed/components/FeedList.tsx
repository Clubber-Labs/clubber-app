import { useState } from 'react'
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
import { EventStatusFilter } from '@/features/events/components/EventStatusFilter'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import type { EventStatus, FeedEvent } from '@/shared/types'

export function FeedList() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<EventStatus[]>([])
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFeed({
    status: statusFilter.length ? statusFilter : undefined,
  })
  const { refreshing, onRefresh } = usePullRefresh(refetch)

  const events = data?.pages.flatMap(page => page.data) ?? []
  const filtering = statusFilter.length > 0

  return (
    <View className="flex-1">
      <View className="pt-3 pb-2 border-b border-zinc-900">
        <EventStatusFilter value={statusFilter} onChange={setStatusFilter} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-zinc-400 text-center">
            Erro ao carregar o feed.
          </Text>
        </View>
      ) : events.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white font-semibold text-base mb-1">
            {filtering ? 'Nenhum evento para esses filtros' : 'Nada por aqui ainda'}
          </Text>
          <Text className="text-zinc-400 text-center text-sm">
            {filtering
              ? 'Tente outros filtros ou limpe a seleção.'
              : 'Siga pessoas para ver os eventos delas no seu feed.'}
          </Text>
        </View>
      ) : (
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
              <ActivityIndicator
                size="small"
                color="#8b5cf6"
                className="py-4"
              />
            ) : null
          }
        />
      )}
    </View>
  )
}
