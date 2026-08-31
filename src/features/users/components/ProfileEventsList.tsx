import { useRef } from 'react'
import type { ReactElement } from 'react'
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { ProfileEventTile } from './ProfileEventTile'
import { ProfileEventsSkeleton } from './ProfileEventsSkeleton'
import { useActiveTabPress } from '@/shared/hooks/useActiveTabPress'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  events: UserEventSummary[]
  // Dono do perfil — o tile assina os eventos que não são dele.
  ownerId: string
  header: ReactElement
  empty: ReactElement
  hasNextPage: boolean
  isFetchingNextPage: boolean
  // 1ª página em voo: a grade fantasma entra no lugar do estado vazio.
  isLoading?: boolean
  // Pull-to-refresh: presente, liga o RefreshControl e troca a grade pela
  // fantasma enquanto dura — mesmo padrão do feed. Ausente, a lista fica sem.
  refreshing?: boolean
  onRefresh?: () => void
  onLoadMore: () => void
  // Aba com pílula/header flutuantes passa os clearances; perfil de terceiros
  // (stack, header no fluxo) usa os defaults.
  bottomPadding?: number
  topPadding?: number
}

type Spacer = { __spacer: string }
type Row = UserEventSummary | Spacer

function isSpacer(row: Row): row is Spacer {
  return '__spacer' in row
}

export function ProfileEventsList({
  events,
  ownerId,
  header,
  empty,
  hasNextPage,
  isFetchingNextPage,
  isLoading = false,
  refreshing = false,
  onRefresh,
  onLoadMore,
  bottomPadding = 32,
  topPadding = 0,
}: Props) {
  const router = useRouter()

  // Re-tap na aba Perfil: volta ao topo. No perfil de terceiros (stack) o
  // evento tabPress nunca é emitido — o hook fica inerte.
  const listRef = useRef<FlatList<Row>>(null)
  useActiveTabPress(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  })

  // numColumns=2: completa a linha ímpar com um espaçador pra os tiles (flex-1)
  // manterem largura igual sem o último esticar pra largura cheia.
  const rows: Row[] =
    events.length % 2 ? [...events, { __spacer: 'spacer' }] : events
  const data: Row[] = refreshing ? [] : rows

  return (
    <FlatList
      ref={listRef}
      data={data}
      numColumns={2}
      keyExtractor={item => (isSpacer(item) ? item.__spacer : item.id)}
      contentContainerStyle={{
        paddingTop: topPadding,
        paddingBottom: bottomPadding,
      }}
      columnWrapperStyle={{ paddingHorizontal: 16, gap: 8 }}
      ListHeaderComponent={header}
      renderItem={({ item }) =>
        isSpacer(item) ? (
          <View className="flex-1" />
        ) : (
          <ProfileEventTile
            event={item}
            ownerId={ownerId}
            onPress={() => router.push(`/events/${item.id}`)}
          />
        )
      }
      ListEmptyComponent={
        isLoading || refreshing ? <ProfileEventsSkeleton /> : empty
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 16 }} />
        ) : null
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandEmphasis}
            // O spinner nasce no topo do scroll view — atrás do header de
            // vidro nas abas. O offset o empurra pro primeiro pixel visível;
            // no stack (topPadding 0) não muda nada.
            progressViewOffset={topPadding}
          />
        ) : undefined
      }
      // refreshing: a grade está escondida atrás da fantasma com data=[] —
      // paginar aqui buscaria página nova pra uma lista fora da tela.
      onEndReached={() => hasNextPage && !refreshing && onLoadMore()}
      onEndReachedThreshold={0.3}
    />
  )
}
