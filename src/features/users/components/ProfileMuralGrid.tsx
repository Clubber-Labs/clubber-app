import { useCallback, type ComponentProps } from 'react'
import type { ListRenderItem } from 'react-native'
import { ActivityIndicator } from 'react-native'
import {
  GestureDetector,
  type NativeGesture,
} from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { ProfileMuralTile } from './ProfileMuralTile'
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
  // Só a seção expandida rola; no resumo a grade é recortada pelo palco.
  scrollEnabled: boolean
  native: NativeGesture
  onScroll: ComponentProps<typeof Animated.FlatList>['onScroll']
  veilStyle: ComponentProps<typeof Animated.View>['style']
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onPressPhoto: (photo: UserPhoto) => void
  bottomPadding: number
}

// Grade 3×N do mural, colada às bordas da tela. A mesma lista serve ao resumo
// (2 fileiras visíveis, o 6º tile com "+N") e ao mural cheio — o palco só
// muda quanto dela aparece.
export function ProfileMuralGrid({
  photos,
  totalCount,
  tileSize,
  scrollEnabled,
  native,
  onScroll,
  veilStyle,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onPressPhoto,
  bottomPadding,
}: Props) {
  const hiddenCount = Math.max(0, totalCount - MURAL_SUMMARY_COUNT)
  // Identidade estável: renderItem novo a cada render faz o FlatList
  // re-renderizar toda célula visível.
  const renderItem = useCallback<ListRenderItem<UserPhoto>>(
    ({ item, index }) => (
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
    [tileSize, totalCount, hiddenCount, veilStyle, onPressPhoto],
  )

  return (
    <GestureDetector gesture={native}>
      <Animated.FlatList
        data={photos}
        numColumns={MURAL_COLUMNS}
        keyExtractor={photo => photo.id}
        scrollEnabled={scrollEnabled}
        // Sem bounce: no topo, arrastar pra baixo é do palco, não da lista.
        bounces={false}
        overScrollMode="never"
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: MURAL_GAP }}
        contentContainerStyle={{ gap: MURAL_GAP, paddingBottom: bottomPadding }}
        // O resumo recorta a grade em vez de fatiar os dados: as fileiras
        // seguintes precisam já existir pra aparecerem conforme ele cresce.
        initialNumToRender={30}
        renderItem={renderItem}
        onEndReached={() => scrollEnabled && hasNextPage && onLoadMore()}
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
