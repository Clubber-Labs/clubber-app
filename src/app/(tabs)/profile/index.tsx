import { useMemo } from 'react'
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
} from 'phosphor-react-native'
import {
  useMyProfile,
  useUploadAvatar,
} from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { usePickAvatar } from '@/features/users/hooks/usePickAvatar'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useFollowRequests } from '@/features/follows/hooks/useFollowRequests'
import { useConfirm } from '@/shared/lib/confirm'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
import { ProfileMusicSection } from '@/features/spotify/components/ProfileMusicSection'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { EditProfileButton } from '@/features/users/components/EditProfileButton'
import { ProfileEventsList } from '@/features/users/components/ProfileEventsList'
import { ProfileEventsSectionTitle } from '@/features/users/components/ProfileEventsSectionTitle'
import { ProfileEventsEmpty } from '@/features/users/components/ProfileEventsEmpty'
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

  const {
    data: eventsData,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage,
    isLoading: eventsLoading,
  } = useUserEvents(userId)
  const uploadAvatar = useUploadAvatar()
  const performLogout = useLogout()
  const confirm = useConfirm()
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
    () => eventsData?.pages.flatMap(p => p.data) ?? [],
    [eventsData],
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
      <ProfileEventsList
        events={events}
        ownerId={userId}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={eventsLoading}
        onLoadMore={fetchNextPage}
        bottomPadding={tabBarClearance}
        topPadding={headerClearance}
        empty={
          <ProfileEventsEmpty
            variant="own"
            onCreate={() => router.push('/events/create')}
          />
        }
        header={
          <>
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
              actions={
                <EditProfileButton
                  onPress={() => router.push('/profile/edit')}
                />
              }
            />
            <ProfileEventsSectionTitle />
          </>
        }
      />
      <ProfileDrawer items={drawerItems} header={drawerHeader} />
    </View>
  )
}
