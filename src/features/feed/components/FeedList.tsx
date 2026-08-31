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
import { FeedKindFilter } from './FeedKindFilter'
import { FeedSpotsNeedLocation } from './FeedSpotsNeedLocation'
import type { FeedItem, FeedKind } from '../types'
import { EventCard } from '@/features/events/components/EventCard'
import { EventStatusFilter } from '@/features/events/components/EventStatusFilter'
import { SpotFeedCard } from '@/features/spots/components/SpotFeedCard'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import { useActiveTabPress } from '@/shared/hooks/useActiveTabPress'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
import { useConsentedLocation } from '@/features/privacy/hooks/useConsentedLocation'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import type { EventStatus } from '@/shared/types'
import { colors } from '@/shared/theme'

export function FeedList() {
  const { t } = useTranslation()
  const router = useRouter()
  const tabBarClearance = useTabBarClearance()
  const headerClearance = useHeaderClearance()
  const [statusFilter, setStatusFilter] = useState<EventStatus[]>([])
  // ALL de saída: com localização o backend mescla, sem ela devolve só eventos
  // — o mesmo que EVENTS teria dado. Não há nada a decidir aqui.
  const [kind, setKind] = useState<FeedKind>('ALL')
  // coords vêm como [lng, lat] (convenção Mapbox). Só envia near com permissão
  // concedida; negado/erro → feed sem proximidade (descoberta só por categoria).
  const { coords, status: locationStatus } = useConsentedLocation()
  const locationResolved = locationStatus !== 'loading'
  const userCoords = locationStatus === 'ready' ? coords : null
  const near = userCoords
    ? { nearLat: userCoords[1], nearLng: userCoords[0] }
    : {}
  // Rolê é ancorado num lugar: pedir SPOTS sem coords devolveria vazio sempre.
  // A tela troca a lista pelo convite a ligar a localização.
  const spotsWithoutLocation = kind === 'SPOTS' && !userCoords
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
      kinds: kind,
      ...near,
    },
    // Espera a localização resolver antes do 1º fetch: evita um fetch sem near
    // seguido de outro com near (reiniciaria a paginação).
    { enabled: locationResolved && !spotsWithoutLocation },
  )
  const { refreshing, onRefresh } = usePullRefresh(refetch)

  // Re-tap na aba Feed: volta ao topo e atualiza (padrão de plataforma).
  const listRef = useRef<FlatList<FeedItem>>(null)
  useActiveTabPress(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
    refetch()
  })

  // Dedup defensivo por id: o mesmo item pode reaparecer entre páginas
  // (empates de ranking ou re-surface por sinais sociais entre sessões).
  // Memoiza pra não reconstruir o Set a cada render não relacionado.
  const items = useMemo(() => flattenInfiniteList(data), [data])
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
      data={!locationResolved || isLoading || isError ? [] : items}
      // O id sozinho não basta: evento e rolê vêm da mesma lista e de tabelas
      // diferentes.
      keyExtractor={(item: FeedItem) => `${item.type}-${item.id}`}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: headerClearance,
        paddingHorizontal: 16,
        paddingBottom: tabBarClearance,
      }}
      ListHeaderComponent={
        <View className="-mx-4 gap-2 pb-3">
          <FeedKindFilter value={kind} onChange={setKind} />
          <EventStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </View>
      }
      ListEmptyComponent={
        !locationResolved || isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brandEmphasis} />
          </View>
        ) : spotsWithoutLocation ? (
          <FeedSpotsNeedLocation />
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
      renderItem={({ item }) =>
        item.type === 'SPOT' ? (
          <SpotFeedCard spot={item} userCoords={userCoords} />
        ) : (
          <EventCard
            event={item}
            onPress={() => router.push(`/events/${item.id}`)}
            // A tela é dona da localização: o useUserLocation monta estado e
            // listener de AppState próprios a cada chamada, então um por card
            // sairia caro numa lista.
            userCoords={userCoords}
          />
        )
      }
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
