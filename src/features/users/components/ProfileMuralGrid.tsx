import { useCallback, type ComponentProps, type ReactElement } from 'react'
import type { FlatList, ListRenderItem } from 'react-native'
import { ActivityIndicator } from 'react-native'
import {
  GestureDetector,
  type NativeGesture,
} from 'react-native-gesture-handler'
import Animated, { type AnimatedRef } from 'react-native-reanimated'
import { ProfileMuralTile } from './ProfileMuralTile'
import { ProfileMuralAddTile } from './ProfileMuralAddTile'
import {
  MURAL_COLUMNS,
  MURAL_GAP,
  MURAL_SUMMARY_COUNT,
} from '../utils/profileStage'
import type { UserPhoto } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  photos: UserPhoto[]
  totalCount: number
  tileSize: number
  // Recuo no topo igual ao header do perfil: a lista começa por baixo dele e o
  // header acompanha o scroll (collapsing header) — ver useProfileStage.
  topInset: number
  // Cabeçalho da seção e estado vazio/carregando VIVEM na lista, pra rolarem
  // junto com o header do perfil.
  header: ReactElement
  empty: ReactElement | null
  // Só a seção expandida carrega mais; no resumo a grade é recortada pelo
  // palco e o offset fica preso em zero (useProfileStage).
  canLoadMore: () => boolean
  native: NativeGesture
  listRef: AnimatedRef<FlatList>
  onScroll: ComponentProps<typeof Animated.FlatList>['onScroll']
  veilStyle: ComponentProps<typeof Animated.View>['style']
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onPressPhoto: (photo: UserPhoto) => void
  // Presente = o "+" do dono entra na vaga livre da última fileira do resumo.
  onAddPhoto?: () => void
  bottomPadding: number
}

type AddSlot = { __add: true }
type Cell = UserPhoto | AddSlot

function isAddSlot(cell: Cell): cell is AddSlot {
  return '__add' in cell
}

const ADD_SLOT: AddSlot = { __add: true }

// Grade do mural (MURAL_COLUMNS × N), colada às bordas da tela. A mesma lista
// serve ao resumo (até 2 fileiras visíveis, o último tile delas com "+N") e ao
// mural cheio — o palco só muda quanto dela aparece.
export function ProfileMuralGrid({
  photos,
  totalCount,
  tileSize,
  topInset,
  header,
  empty,
  canLoadMore,
  native,
  listRef,
  onScroll,
  veilStyle,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onPressPhoto,
  onAddPhoto,
  bottomPadding,
}: Props) {
  const hiddenCount = Math.max(0, totalCount - MURAL_SUMMARY_COUNT)
  const cells: Cell[] = onAddPhoto ? [...photos, ADD_SLOT] : photos
  // Identidade estável: renderItem novo a cada render faz o FlatList
  // re-renderizar toda célula visível.
  const renderItem = useCallback<ListRenderItem<Cell>>(
    ({ item, index }) =>
      isAddSlot(item) ? (
        <ProfileMuralAddTile size={tileSize} onPress={onAddPhoto} />
      ) : (
        <ProfileMuralTile
          photo={item}
          size={tileSize}
          index={index}
          total={totalCount}
          veilCount={index === MURAL_SUMMARY_COUNT - 1 ? hiddenCount : 0}
          veilStyle={veilStyle}
          onPress={onPressPhoto}
        />
      ),
    [tileSize, totalCount, hiddenCount, veilStyle, onPressPhoto, onAddPhoto],
  )

  return (
    <GestureDetector gesture={native}>
      <Animated.FlatList
        ref={listRef}
        data={cells}
        numColumns={MURAL_COLUMNS}
        keyExtractor={cell => (isAddSlot(cell) ? '__add' : cell.id)}
        // Sempre rolável: fora do encaixe o palco prende o offset em zero.
        // Sem bounce: no topo, arrastar pra baixo é do palco, não da lista.
        bounces={false}
        overScrollMode="never"
        onScroll={onScroll}
        // Todo evento, sem throttle: a trava reage no próprio evento.
        scrollEventThrottle={1}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        columnWrapperStyle={{ gap: MURAL_GAP }}
        contentContainerStyle={{
          gap: MURAL_GAP,
          paddingTop: topInset,
          paddingBottom: bottomPadding,
        }}
        // O resumo recorta a grade em vez de fatiar os dados: as fileiras
        // seguintes precisam já existir pra aparecerem conforme ele cresce.
        initialNumToRender={30}
        renderItem={renderItem}
        onEndReached={() => canLoadMore() && hasNextPage && onLoadMore()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.brand} style={{ marginTop: 16 }} />
          ) : null
        }
      />
    </GestureDetector>
  )
}
