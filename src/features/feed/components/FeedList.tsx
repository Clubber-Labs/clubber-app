import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { FeedKindTabs } from './FeedKindTabs'
import { FeedRow } from './FeedRow'
import { FeedSkeleton } from './FeedSkeleton'
import { FeedSpotsNeedLocation } from './FeedSpotsNeedLocation'
import type { FeedItem, FeedKind } from '../types'
import { EventStatusFilter } from '@/features/events/components/EventStatusFilter'
import { Collapsible } from '@/shared/components/Collapsible'
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
  // Próximos/Passados é vocabulário de evento — rolê vive numa janela curta e
  // não tem esse eixo. A linha some na aba Rolês, mas a seleção fica no state:
  // voltar pra Eventos devolve o filtro como estava.
  const statusApplies = kind !== 'SPOTS'
  const status = statusApplies && statusFilter.length ? statusFilter : undefined
  const {
    data,
    counts,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFeed(
    {
      status,
      kinds: kind,
      ...near,
    },
    // Espera a localização resolver antes do 1º fetch: evita um fetch sem near
    // seguido de outro com near (reiniciaria a paginação).
    { enabled: locationResolved && !spotsWithoutLocation },
  )
  const { refreshing, onRefresh } = usePullRefresh(refetch)
  // Estável: um arrow novo por render anularia o memo da linha.
  const openEvent = useCallback(
    (id: string) => router.push(`/events/${id}`),
    [router],
  )

  // Re-tap na aba Feed: volta ao topo e atualiza (padrão de plataforma).
  const listRef = useRef<FlatList<FeedItem>>(null)
  useActiveTabPress(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
    refetch()
  })

  // Toda troca de lista passa pelo skeleton, MESMO com cache quente. Sem o
  // respiro, o react-query entrega os itens síncronos no próprio toque e o
  // desmonte+monte de todos os cards cai num commit só — o engasgo de volta.
  // Com ele, a lista esvazia barata e o preenchimento chega em lotes
  // (maxToRenderPerBatch), igual ao caminho de rede. A duração segura o
  // suficiente pra não ler como flash quando os dados já estão prontos.
  const [switching, setSwitching] = useState(false)
  useEffect(() => {
    if (!switching) return
    const timer = setTimeout(() => setSwitching(false), 250)
    return () => clearTimeout(timer)
  }, [switching])

  // A nova lista nasce no topo; sem isto ela herdaria o offset da anterior
  // (skeleton fora da viewport, ou cards da outra aba num pulo de scroll).
  const beginListSwitch = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
    setSwitching(true)
  }, [])

  const changeKind = useCallback(
    (next: FeedKind) => {
      beginListSwitch()
      setKind(next)
    },
    [beginListSwitch],
  )

  // Chips de status mudam a queryKey do mesmo jeito que as abas — mesma
  // mecânica de swap, mesmo remédio.
  const changeStatus = useCallback(
    (next: EventStatus[]) => {
      beginListSwitch()
      setStatusFilter(next)
    },
    [beginListSwitch],
  )

  // Dedup defensivo por id: o mesmo item pode reaparecer entre páginas
  // (empates de ranking ou re-surface por sinais sociais entre sessões).
  // Memoiza pra não reconstruir o Set a cada render não relacionado.
  const items = useMemo(() => flattenInfiniteList(data), [data])
  const filtering = status !== undefined

  // Tudo (abas e chips de filtro inclusos) vive na FlatList: o conteúdo rola
  // por baixo do header de vidro. Estados de load/erro/vazio entram como
  // ListEmptyComponent pra manter os filtros visíveis e o scroll contínuo.
  return (
    <FlatList
      // A lista hospeda o input de comentário/post: sem isto o primeiro toque em
      // Enviar apenas fecha o teclado, e o usuário precisa tocar duas vezes.
      keyboardShouldPersistTaps="handled"
      ref={listRef}
      className="flex-1"
      data={
        spotsWithoutLocation ||
        !locationResolved ||
        isLoading ||
        isError ||
        switching ||
        refreshing
          ? []
          : items
      }
      // Chave composta por legibilidade, não por necessidade: os ids são uuid()
      // nas duas tabelas e não colidem — é o que deixa o resto do app casar
      // item de feed por id cru (like, presença, remoção otimista).
      keyExtractor={(item: FeedItem) => `${item.type}-${item.id}`}
      // Cada card ocupa quase uma tela e paga duas rodadas de medição (moldura e
      // picote) mais os SVGs. Nos defaults do RN a troca de aba montava 10 de
      // uma vez — o toque na aba engasgava esperando isso. Dois cobrem a
      // viewport; o resto entra em lotes pequenos, já com a lista respondendo.
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      updateCellsBatchingPeriod={80}
      windowSize={5}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: headerClearance,
        paddingHorizontal: 16,
        paddingBottom: tabBarClearance,
      }}
      ListHeaderComponent={
        <View className="-mx-4 pb-3">
          <FeedKindTabs value={kind} onChange={changeKind} counts={counts} />
          <Collapsible open={statusApplies}>
            <View className="pt-3">
              <EventStatusFilter value={statusFilter} onChange={changeStatus} />
            </View>
          </Collapsible>
        </View>
      }
      ListEmptyComponent={
        // Convite de localização antes do skeleton: com a query desligada não
        // há fetch a caminho, e o fantasma prometeria uma lista que não vem.
        spotsWithoutLocation ? (
          <FeedSpotsNeedLocation />
        ) : !locationResolved || isLoading || switching || refreshing ? (
          <FeedSkeleton kind={kind} />
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
        <FeedRow item={item} userCoords={userCoords} onOpenEvent={openEvent} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brandEmphasis}
          // O spinner nasce no topo do scroll view — atrás do header de
          // vidro. O offset o empurra pro primeiro pixel visível.
          progressViewOffset={headerClearance}
        />
      }
      onEndReached={() => {
        // switching/refreshing: o skeleton está no lugar da lista com data=[],
        // mas a query já tem páginas — paginar aqui buscaria página nova pra
        // uma lista que não está na tela.
        if (hasNextPage && !isFetchingNextPage && !switching && !refreshing) {
          fetchNextPage()
        }
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
