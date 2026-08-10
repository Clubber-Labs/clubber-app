import { useMemo, useRef, useState } from 'react'
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
import { useActiveTabPress } from '@/shared/hooks/useActiveTabPress'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
import { useUserLocation } from '@/shared/hooks/useUserLocation'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import type { EventStatus, FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

export function FeedList() {
  const router = useRouter()
  const tabBarClearance = useTabBarClearance()
  const headerClearance = useHeaderClearance()
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

  // Re-tap na aba Feed: volta ao topo e atualiza (padrão de plataforma).
  const listRef = useRef<FlatList<FeedEvent>>(null)
  useActiveTabPress(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
    refetch()
  })

  // Dedup defensivo por id: o mesmo evento pode reaparecer entre páginas
  // (empates de ranking ou re-surface por sinais sociais entre sessões).
  // Memoiza pra não reconstruir o Set a cada render não relacionado.
  const events = useMemo(() => flattenInfiniteList(data), [data])
  const filtering = statusFilter.length > 0

  // Tudo (chips de filtro inclusos) vive na FlatList: o conteúdo rola por
  // baixo do header de vidro. Estados de load/erro/vazio entram como
  // ListEmptyComponent pra manter os chips visíveis e o scroll contínuo.
  return (
    <FlatList
      ref={listRef}
      className="flex-1"
      data={!locationResolved || isLoading || isError ? [] : events}
      keyExtractor={(item: FeedEvent) => item.id}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: headerClearance,
        paddingHorizontal: 16,
        paddingBottom: tabBarClearance,
      }}
      ListHeaderComponent={
        <View className="-mx-4 pb-3">
          <EventStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </View>
      }
      ListEmptyComponent={
        !locationResolved || isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brandEmphasis} />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-content-muted text-center">
              Erro ao carregar o feed.
            </Text>
          </View>
        ) : (
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
        )
      }
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
  )
}
