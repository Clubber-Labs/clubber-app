import { memo, type ComponentProps } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { NativeGesture } from 'react-native-gesture-handler'
import type Animated from 'react-native-reanimated'
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
  scrollEnabled: boolean
  native: NativeGesture
  onScroll: ComponentProps<typeof Animated.FlatList>['onScroll']
  veilStyle: ComponentProps<typeof Animated.View>['style']
  // Mais que as duas fileiras do resumo: mostra "Ver todas" e aceita o gesto.
  expandable: boolean
  onPressPhoto: (photo: UserPhoto) => void
  onAddPhoto?: () => void
  onViewAll: () => void
  bottomPadding: number
}

// memo: ao encaixar, o palco só re-renderiza a seção cujo scrollEnabled mudou.
export const ProfileMuralSection = memo(function ProfileMuralSection({
  photos,
  isOwnProfile,
  tileSize,
  scrollEnabled,
  native,
  onScroll,
  veilStyle,
  expandable,
  onPressPhoto,
  onAddPhoto,
  onViewAll,
  bottomPadding,
}: Props) {
  const { t } = useTranslation()
  const hasPhotos = photos.items.length > 0
  const showAddTile =
    isOwnProfile && !!onAddPhoto && muralHasFreeSlot(photos.items.length)

  return (
    <View className="flex-1 bg-background">
      <ProfileSectionHeader
        title={t('profile.mural.title')}
        count={photos.totalCount}
        action={expandable ? t('profile.mural.viewAll') : undefined}
        onAction={expandable ? onViewAll : undefined}
      />
      {photos.isLoading ? (
        <ProfileMuralSkeleton tileSize={tileSize} />
      ) : hasPhotos ? (
        <ProfileMuralGrid
          photos={photos.items}
          totalCount={photos.totalCount}
          tileSize={tileSize}
          scrollEnabled={scrollEnabled}
          native={native}
          onScroll={onScroll}
          veilStyle={veilStyle}
          hasNextPage={photos.hasNextPage}
          isFetchingNextPage={photos.isFetchingNextPage}
          onLoadMore={photos.onLoadMore}
          onPressPhoto={onPressPhoto}
          onAddPhoto={showAddTile ? onAddPhoto : undefined}
          bottomPadding={bottomPadding}
        />
      ) : (
        <ProfileMuralEmpty isOwnProfile={isOwnProfile} />
      )}
    </View>
  )
})
