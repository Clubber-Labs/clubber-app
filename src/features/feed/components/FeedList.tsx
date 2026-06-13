import { useMemo, useState } from 'react'
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
import { useUserLocation } from '@/shared/hooks/useUserLocation'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import type { EventStatus, FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

export function FeedList() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<EventStatus[]>([])
  // coords vêm como [lng, lat] (convenção Mapbox). Só envia near com permissão
  // concedida; negado/erro → feed sem proximidade (descoberta só por categoria).
  const { coords, status: locationStatus } = useUserLocation()
  const locationResolved = locationStatus !== 'loading'
  const near =
    locationStatus === 'ready' && coords
      ? { nearLat: coords[1], nearLng: coords[0] }
      : {}
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFeed(
    {
      status: statusFilter.length ? statusFilter : undefined,
      ...near,
    },
    // Espera a localização resolver antes do 1º fetch: evita um fetch sem near
    // seguido de outro com near (reiniciaria a paginação).
    { enabled: locationResolved },
  )
  const { refreshing, onRefresh } = usePullRefresh(refetch)

  // Dedup defensivo por id: o mesmo evento pode reaparecer entre páginas
  // (empates de ranking ou re-surface por sinais sociais entre sessões).
  // Memoiza pra não reconstruir o Set a cada render não relacionado.
  const events = useMemo(() => flattenInfiniteList(data), [data])
  const filtering = statusFilter.length > 0

  return (
    <View className="flex-1">
      <View className="pt-3 pb-2 border-b border-line-subtle">
        <EventStatusFilter value={statusFilter} onChange={setStatusFilter} />
      </View>

      {!locationResolved || isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brandEmphasis} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-content-muted text-center">
            Erro ao carregar o feed.
          </Text>
        </View>
      ) : events.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-content font-semibold text-base mb-1">
            {filtering
              ? 'Nenhum evento para esses filtros'
              : 'Nada por aqui ainda'}
          </Text>
          <Text className="text-content-muted text-center text-sm">
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
              tintColor={colors.brandEmphasis}
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
                color={colors.brandEmphasis}
                className="py-4"
              />
            ) : null
          }
        />
      )}
    </View>
  )
}
