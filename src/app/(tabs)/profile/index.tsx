import { useMemo } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import {
  useMyProfile,
  useUploadAvatar,
} from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { usePickAvatar } from '@/features/users/hooks/usePickAvatar'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useFollowRequests } from '@/features/follows/hooks/useFollowRequests'
import { useConfirm } from '@/shared/lib/confirm'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { ProfileStats } from '@/features/users/components/ProfileStats'
import { ProfileEventsList } from '@/features/users/components/ProfileEventsList'
import { ProfileLoading } from '@/features/users/components/ProfileLoading'
import { ProfileEmpty } from '@/features/users/components/ProfileEmpty'
import {
  ProfileDrawer,
  type DrawerItem,
} from '@/features/users/components/ProfileDrawer'

export default function ProfileScreen() {
  const router = useRouter()
  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const userId = profile?.id ?? ''

  const {
    data: eventsData,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage,
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
      title: 'Sair',
      message: 'Tem certeza que deseja sair?',
      confirmLabel: 'Sair',
      destructive: true,
    })
    if (ok) performLogout()
  }

  if (profileLoading) return <ProfileLoading />
  if (!profile)
    return <ProfileEmpty message="Não foi possível carregar o perfil." />

  const drawerItems: DrawerItem[] = [
    ...(profile.isPrivate
      ? [
          {
            label: 'Solicitações de follow',
            icon: 'person-add-outline' as const,
            badge: pendingRequestsBadge,
            onPress: () => router.push('/profile/follow-requests'),
          },
        ]
      : []),
    {
      label: 'Sobre o app',
      icon: 'information-circle-outline',
      onPress: () => router.push('/about'),
    },
    {
      label: 'Sair',
      icon: 'log-out-outline',
      onPress: handleLogout,
      destructive: true,
    },
  ]

  const drawerHeader = (
    <View className="pt-12 pb-4 px-5 border-b border-zinc-900">
      <Text className="text-white font-bold text-lg">
        {profile.name} {profile.lastname}
      </Text>
      <Text className="text-zinc-400 text-sm mt-0.5">@{profile.username}</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-black">
      <ProfileEventsList
        events={events}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        header={
          <>
            <ProfileHeader
              profile={profile}
              isOwnProfile
              avatarUploading={uploadAvatar.isPending}
              onAvatarPress={handlePickAvatar}
              onEditPress={() => router.push('/profile/edit')}
            />
            <ProfileStats
              eventsCount={profile.eventsCount}
              followersCount={profile.followersCount}
              followingCount={profile.followingCount}
              onFollowersPress={() =>
                router.push(`/users/${profile.id}/followers`)
              }
              onFollowingPress={() =>
                router.push(`/users/${profile.id}/following`)
              }
            />
            <View className="mt-4 mb-3">
              <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Eventos
              </Text>
            </View>
          </>
        }
      />
      <ProfileDrawer items={drawerItems} header={drawerHeader} />
    </View>
  )
}
