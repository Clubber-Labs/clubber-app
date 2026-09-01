import { useMemo, useState } from 'react'
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  UserPlusIcon,
  CrownIcon,
  GearIcon,
  ShieldCheckIcon,
  InfoIcon,
  SignOutIcon,
  PlusIcon,
} from 'phosphor-react-native'
import {
  useMyProfile,
  useUploadAvatar,
} from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { useUserPhotos } from '@/features/users/hooks/useUserPhotos'
import { useDeleteUserPhoto } from '@/features/users/hooks/useDeleteUserPhoto'
import { usePickAvatar } from '@/features/users/hooks/usePickAvatar'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useFollowRequests } from '@/features/follows/hooks/useFollowRequests'
import { useConfirm } from '@/shared/lib/confirm'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { Fab } from '@/shared/components/Fab'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
import { ProfileMusicSection } from '@/features/spotify/components/ProfileMusicSection'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { EditProfileButton } from '@/features/users/components/EditProfileButton'
import { ProfileStage } from '@/features/users/components/ProfileStage'
import { ProfilePhotoViewer } from '@/features/users/components/ProfilePhotoViewer'
import { InterestsSheet } from '@/features/users/components/InterestsSheet'
import { ProfileLoading } from '@/features/users/components/ProfileLoading'
import { ProfileEmpty } from '@/features/users/components/ProfileEmpty'
import {
  ProfileDrawer,
  type DrawerItem,
} from '@/features/users/components/ProfileDrawer'

export default function ProfileScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const tabBarClearance = useTabBarClearance()
  const headerClearance = useHeaderClearance(0)
  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const userId = profile?.id ?? ''

  const eventsQuery = useUserEvents(userId)
  const photosQuery = useUserPhotos(userId)
  const deletePhoto = useDeleteUserPhoto(userId)
  const uploadAvatar = useUploadAvatar()
  const performLogout = useLogout()
  const confirm = useConfirm()
  const [viewerPhotoId, setViewerPhotoId] = useState<string | null>(null)
  const [interestsOpen, setInterestsOpen] = useState(false)
  const { data: requestsData } = useFollowRequests(profile?.isPrivate === true)
  const firstRequestsPage = requestsData?.pages?.[0]
  const pendingFirstPageCount = firstRequestsPage?.data.length ?? 0
  // Backend não retorna total; quando há próxima página, mostramos "N+" pra
  // não passar contagem enganosa ao usuário.
  const pendingRequestsBadge =
    pendingFirstPageCount > 0
      ? firstRequestsPage?.nextCursor
        ? `${pendingFirstPageCount}+`
        : pendingFirstPageCount
      : 0

  const events = useMemo(
    () => eventsQuery.data?.pages.flatMap(p => p.data) ?? [],
    [eventsQuery.data],
  )
  const photos = useMemo(
    () => photosQuery.data?.pages.flatMap(p => p.data) ?? [],
    [photosQuery.data],
  )

  const handlePickAvatar = usePickAvatar(uri => uploadAvatar.mutate(uri))

  async function handleLogout() {
    const ok = await confirm({
      title: t('profile.logout'),
      message: t('profile.logoutMessage'),
      confirmLabel: t('profile.logout'),
      destructive: true,
    })
    if (ok) performLogout()
  }

  async function handleDeletePhoto(photoId: string) {
    const ok = await confirm({
      title: t('profile.mural.deleteTitle'),
      message: t('profile.mural.deleteMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    })
    if (ok) deletePhoto.mutate(photoId)
  }

  if (profileLoading) return <ProfileLoading />
  if (!profile) return <ProfileEmpty message={t('profile.loadError')} />

  const drawerItems: DrawerItem[] = [
    ...(profile.isPrivate
      ? [
          {
            label: t('profile.menu.followRequests'),
            icon: UserPlusIcon,
            badge: pendingRequestsBadge,
            onPress: () => router.push('/profile/follow-requests'),
          },
        ]
      : []),
    {
      label: profile.isPremium
        ? t('profile.menu.subscription')
        : t('profile.menu.premium'),
      icon: CrownIcon,
      onPress: () =>
        router.push(profile.isPremium ? '/billing/manage' : '/billing/upgrade'),
    },
    {
      label: t('profile.menu.settings'),
      icon: GearIcon,
      onPress: () => router.push('/settings'),
    },
    {
      label: t('profile.menu.privacy'),
      icon: ShieldCheckIcon,
      onPress: () => router.push('/profile/privacy'),
    },
    {
      label: t('profile.menu.about'),
      icon: InfoIcon,
      onPress: () => router.push('/about'),
    },
    {
      label: t('profile.logout'),
      icon: SignOutIcon,
      onPress: handleLogout,
    },
  ]

  const drawerHeader = (
    // Divisor no hairline do vidro (o drawer é GlassSurface).
    <View
      className="pt-5 pb-4 px-5 border-b flex-row items-center gap-3"
      style={{ borderBottomColor: 'rgba(255, 255, 255, 0.13)' }}
    >
      <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size={48} />
      <View className="flex-1">
        <Text className="text-content font-bold text-lg" numberOfLines={1}>
          {profile.name} {profile.lastname}
        </Text>
        <Text className="text-content-muted text-sm mt-0.5" numberOfLines={1}>
          @{profile.username}
        </Text>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      <ProfileStage
        ownerId={userId}
        isOwnProfile
        topPadding={headerClearance}
        bottomPadding={tabBarClearance}
        header={
          <ProfileHeader
            profile={profile}
            highlights={
              <ProfileMusicSection
                featured={profile.featuredArtist}
                artists={profile.topArtists ?? []}
                windows={profile.artistWindows}
              />
            }
            isOwnProfile
            avatarUploading={uploadAvatar.isPending}
            onAvatarPress={handlePickAvatar}
            onFollowersPress={() =>
              router.push(`/users/${profile.id}/followers`)
            }
            onFollowingPress={() =>
              router.push(`/users/${profile.id}/following`)
            }
            onInterestsPress={() => setInterestsOpen(true)}
            actions={
              <EditProfileButton onPress={() => router.push('/profile/edit')} />
            }
          />
        }
        photos={{
          items: photos,
          totalCount: profile.photosCount ?? photos.length,
          isLoading: photosQuery.isLoading,
          hasNextPage: photosQuery.hasNextPage ?? false,
          isFetchingNextPage: photosQuery.isFetchingNextPage,
          onLoadMore: photosQuery.fetchNextPage,
        }}
        events={{
          items: events,
          totalCount: profile.eventsCount,
          isLoading: eventsQuery.isLoading,
          hasNextPage: eventsQuery.hasNextPage ?? false,
          isFetchingNextPage: eventsQuery.isFetchingNextPage,
          onLoadMore: eventsQuery.fetchNextPage,
        }}
        onPressPhoto={photo => setViewerPhotoId(photo.id)}
        onAddPhoto={() => router.push('/profile/photos/create')}
        onCreateEvent={() => router.push('/events/create')}
      />

      <ProfilePhotoViewer
        photos={photos}
        photoId={viewerPhotoId}
        isOwner
        onClose={() => setViewerPhotoId(null)}
        onDelete={handleDeletePhoto}
        onOpenEvent={eventId => router.push(`/events/${eventId}`)}
      />
      <InterestsSheet
        visible={interestsOpen}
        onClose={() => setInterestsOpen(false)}
        profile={profile}
      />
      {/* No perfil o "+" só tem um sentido: foto no mural. Direto, sem seletor. */}
      <Fab
        icon={PlusIcon}
        accessibilityLabel={t('profile.photo.title')}
        onPress={() => router.push('/profile/photos/create')}
      />
      <ProfileDrawer items={drawerItems} header={drawerHeader} />
    </View>
  )
}
