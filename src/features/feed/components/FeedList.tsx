import { useMemo, useRef, useState } from 'react'
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useFeed } from '../hooks/useFeed'
import { EventCard } from '@/features/events/components/EventCard'
import { EventStatusFilter } from '@/features/events/components/EventStatusFilter'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import { useActiveTabPress } from '@/shared/hooks/useActiveTabPress'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
import { useConsentedLocation } from '@/features/privacy/hooks/useConsentedLocation'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import type { EventStatus, FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

export function FeedList() {
  const { t } = useTranslation()
  const router = useRouter()
  const tabBarClearance = useTabBarClearance()
  const headerClearance = useHeaderClearance()
  const [statusFilter, setStatusFilter] = useState<EventStatus[]>([])
  // coords vêm como [lng, lat] (convenção Mapbox). Só envia near com permissão
  // concedida; negado/erro → feed sem proximidade (descoberta só por categoria).
  const { coords, status: locationStatus } = useConsentedLocation()
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
      // A lista hospeda o input de comentário/post: sem isto o primeiro toque em
      // Enviar apenas fecha o teclado, e o usuário precisa tocar duas vezes.
      keyboardShouldPersistTaps="handled"
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
              {t('feed.error')}
            </Text>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-content font-semibold text-base mb-1">
              {filtering ? t('feed.emptyFilteredTitle') : t('feed.emptyTitle')}
            </Text>
            <Text className="text-content-muted text-center text-sm">
              {filtering ? t('feed.emptyFilteredBody') : t('feed.emptyBody')}
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
