import { memo, type ComponentProps } from 'react'
import type { FlatList } from 'react-native'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { NativeGesture } from 'react-native-gesture-handler'
import type Animated from 'react-native-reanimated'
import type { AnimatedRef } from 'react-native-reanimated'
import { ProfileSectionHeader } from './ProfileSectionHeader'
import { ProfileMuralGrid } from './ProfileMuralGrid'
import { ProfileMuralSkeleton } from './ProfileMuralSkeleton'
import { ProfileMuralEmpty } from './ProfileMuralEmpty'
import type { StageList } from './ProfileStage'
import { muralHasFreeSlot } from '../utils/profileStage'
import type { UserPhoto } from '@/shared/types'

type Props = {
  photos: StageList<UserPhoto>
  isOwnProfile: boolean
  tileSize: number
  topInset: number
  // Expandido e parado: a grade é dona do scroll de verdade.
  expanded: boolean
  native: NativeGesture
  listRef: AnimatedRef<FlatList>
  onScroll: ComponentProps<typeof Animated.FlatList>['onScroll']
  veilStyle: ComponentProps<typeof Animated.View>['style']
  // Mais que as duas fileiras do resumo: mostra "Ver todas" e aceita o gesto.
  expandable: boolean
  onPressPhoto: (photo: UserPhoto) => void
  onAddPhoto?: () => void
  onViewAll: () => void
  bottomPadding: number
}

// memo: ao encaixar, o palco só re-renderiza a seção cujo `expanded` mudou.
// Tudo (cabeçalho, grade, vazio, fantasma) mora na lista: é ela que rola sob o
// header do perfil e o leva junto.
export const ProfileMuralSection = memo(function ProfileMuralSection({
  photos,
  isOwnProfile,
  tileSize,
  topInset,
  expanded,
  native,
  listRef,
  onScroll,
  veilStyle,
  expandable,
  onPressPhoto,
  onAddPhoto,
  onViewAll,
  bottomPadding,
}: Props) {
  const { t } = useTranslation()
  const showAddTile =
    isOwnProfile && !!onAddPhoto && muralHasFreeSlot(photos.items.length)

  return (
    <View className="flex-1 bg-background">
      <ProfileMuralGrid
        photos={photos.isLoading ? [] : photos.items}
        totalCount={photos.totalCount}
        tileSize={tileSize}
        topInset={topInset}
        header={
          <ProfileSectionHeader
            title={t('profile.mural.title')}
            count={photos.totalCount}
            action={expandable ? t('profile.mural.viewAll') : undefined}
            onAction={expandable ? onViewAll : undefined}
          />
        }
        empty={
          photos.isLoading ? (
            <ProfileMuralSkeleton tileSize={tileSize} />
          ) : (
            <ProfileMuralEmpty isOwnProfile={isOwnProfile} />
          )
        }
        expanded={expanded}
        native={native}
        listRef={listRef}
        onScroll={onScroll}
        veilStyle={veilStyle}
        hasNextPage={photos.hasNextPage}
        isFetchingNextPage={photos.isFetchingNextPage}
        onLoadMore={photos.onLoadMore}
        onPressPhoto={onPressPhoto}
        onAddPhoto={showAddTile ? onAddPhoto : undefined}
        bottomPadding={bottomPadding}
      />
    </View>
  )
})
