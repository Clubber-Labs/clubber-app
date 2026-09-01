import { memo, useCallback, type ComponentProps } from 'react'
import type { FlatList, ListRenderItem } from 'react-native'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { CaretUpIcon } from 'phosphor-react-native'
import {
  GestureDetector,
  type NativeGesture,
} from 'react-native-gesture-handler'
import Animated, { type AnimatedRef } from 'react-native-reanimated'
import { ProfileSectionHeader } from './ProfileSectionHeader'
import { ProfileEventTile } from './ProfileEventTile'
import { ProfileEventsSkeleton } from './ProfileEventsSkeleton'
import { ProfileEventsEmpty } from './ProfileEventsEmpty'
import type { StageList } from './ProfileStage'
import { STAGE_SECTION_GAP } from '../utils/profileStage'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

// Respiro acima e abaixo da alça, somado ao respiro entre as seções: a alça
// precisa de ar por cima pra não colar no arredondado da folha.
const HANDLE_PADDING_TOP = 12
const HANDLE_PADDING_BOTTOM = 6

type Props = {
  events: StageList<UserEventSummary>
  // Dono do perfil — o tile assina os eventos que não são dele.
  ownerId: string
  isOwnProfile: boolean
  // Altura do header do perfil. A lista vive header + mural ACIMA da folha
  // (o quadro dela cobre o palco inteiro, do topo) e o conteúdo recua o mesmo
  // tanto: rolar tira esse recuo — a folha encaixa, o header colapsa e o
  // conteúdo alcança o topo da tela. Ver useProfileStage.
  topInset: number
  // Altura do resumo do mural: os primeiros `dockOffset` px de rolagem são a
  // folha subindo até encaixar — o snap nativo devolve pra 0 ou pra cá.
  dockOffset: number
  // Encaixada e parada — lido na hora (ref no useProfileStage), não no
  // render: o encaixe não pode re-renderizar a seção no rabo da animação.
  canLoadMore: () => boolean
  // Fade da pista "Ver todos ↑" conforme a folha encaixa (1 − expand).
  hintStyle: ComponentProps<typeof Animated.View>['style']
  listStyle: ComponentProps<typeof Animated.View>['style']
  native: NativeGesture
  listRef: AnimatedRef<FlatList>
  onScroll: ComponentProps<typeof Animated.FlatList>['onScroll']
  onCreate?: () => void
  // Expande a seção (o mesmo que puxar pra cima).
  onViewAll: () => void
  bottomPadding: number
}

type Spacer = { __spacer: string }
type Row = UserEventSummary | Spacer

function isSpacer(row: Row): row is Spacer {
  return '__spacer' in row
}

// Vitrine de eventos (tiles do design 8a) em duas colunas. Vive na folha do
// palco do perfil: no resumo só a primeira fileira aparece; encaixada, rola.
export const ProfileEventsSection = memo(function ProfileEventsSection({
  events,
  ownerId,
  isOwnProfile,
  topInset,
  dockOffset,
  canLoadMore,
  hintStyle,
  listStyle,
  native,
  listRef,
  onScroll,
  onCreate,
  onViewAll,
  bottomPadding,
}: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  // numColumns=2: completa a linha ímpar com um espaçador pra os tiles (flex-1)
  // manterem largura igual sem o último esticar pra largura cheia.
  const rows: Row[] =
    events.items.length % 2
      ? [...events.items, { __spacer: 'spacer' }]
      : events.items

  const openEvent = useCallback(
    (event: UserEventSummary) => router.push(`/events/${event.id}`),
    [router],
  )
  const renderItem = useCallback<ListRenderItem<Row>>(
    ({ item }) =>
      isSpacer(item) ? (
        <View className="flex-1" />
      ) : (
        <ProfileEventTile event={item} ownerId={ownerId} onPress={openEvent} />
      ),
    [ownerId, openEvent],
  )

  // A pista de "puxe pra cima" existe com conteúdo e ESMAECE no encaixe
  // (hintStyle) — encaixada ela não faz sentido, mas sumir por render seria
  // um commit no rabo da animação. O toque na pista invisível é inócuo:
  // expandir o que já está expandido não move nada.
  const showHint = events.items.length > 0

  return (
    <Animated.View
      style={[styles.list, { top: -(topInset + dockOffset) }, listStyle]}
    >
      <GestureDetector gesture={native}>
        <Animated.FlatList
          ref={listRef}
          data={rows}
          numColumns={2}
          keyExtractor={item => (isSpacer(item) ? item.__spacer : item.id)}
          // Sempre rolável: fora do encaixe o palco prende o offset em zero
          // (useProfileStage). Sem bounce: no topo, arrastar pra baixo é do
          // palco, não da lista.
          bounces={false}
          overScrollMode="never"
          onScroll={onScroll}
          // Todo evento, sem throttle: folha, header e pista seguem o offset
          // por transform, e um frame sem evento seria um frame de salto.
          scrollEventThrottle={1}
          // Soltar no meio do encaixe: física nativa decide entre resumo e
          // encaixada; dali pra frente a rolagem é livre.
          snapToOffsets={[0, dockOffset]}
          snapToEnd={false}
          showsVerticalScrollIndicator={false}
          // O recuo do fim compensa a faixa da lista que passa do pé do palco
          // e o curso extra do encaixe (dockOffset).
          contentContainerStyle={{
            paddingTop: topInset + dockOffset,
            paddingBottom: bottomPadding + topInset + dockOffset,
          }}
          columnWrapperStyle={{ paddingHorizontal: 16, gap: 8 }}
          // Alça e cabeçalho moram na lista pra rolarem junto quando ela
          // rola. A alça é o sinal universal de "puxe pra cima".
          ListHeaderComponent={
            <>
              <View
                className="items-center"
                style={{
                  paddingTop: STAGE_SECTION_GAP + HANDLE_PADDING_TOP,
                  paddingBottom: HANDLE_PADDING_BOTTOM,
                }}
              >
                <View className="h-1 w-9 rounded-full bg-surface-high" />
              </View>
              <ProfileSectionHeader
                title={t('profile.eventsSection')}
                count={events.totalCount}
                action={showHint ? t('profile.eventsViewAll') : undefined}
                actionIcon={showHint ? CaretUpIcon : undefined}
                onAction={showHint ? onViewAll : undefined}
                actionStyle={hintStyle}
              />
            </>
          }
          // Montar células no meio do scroll é um commit do React na thread
          // JS, e no Fabric isso adia o transform do header pro commit —
          // o "travadinha" do collapsing header. Pré-monta a primeira leva.
          initialNumToRender={16}
          renderItem={renderItem}
          ListEmptyComponent={
            events.isLoading ? (
              <ProfileEventsSkeleton />
            ) : (
              <ProfileEventsEmpty
                variant={isOwnProfile ? 'own' : 'other'}
                onCreate={onCreate}
              />
            )
          }
          ListFooterComponent={
            events.isFetchingNextPage ? (
              <ActivityIndicator
                color={colors.brand}
                style={{ marginTop: 16 }}
              />
            ) : null
          }
          onEndReached={() =>
            canLoadMore() && events.hasNextPage && events.onLoadMore()
          }
          onEndReachedThreshold={0.3}
        />
      </GestureDetector>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  list: { position: 'absolute', left: 0, right: 0, bottom: 0 },
})
