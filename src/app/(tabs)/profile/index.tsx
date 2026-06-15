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
import { EditProfileButton } from '@/features/users/components/EditProfileButton'
import { ProfileEventsList } from '@/features/users/components/ProfileEventsList'
import { ProfileEventsEmpty } from '@/features/users/components/ProfileEventsEmpty'
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
      label: profile.isPremium ? 'Assinatura' : 'ConnectAI Premium',
      icon: 'diamond-outline',
      onPress: () =>
        router.push(profile.isPremium ? '/billing/manage' : '/billing/upgrade'),
    },
    {
      label: 'Configurações',
      icon: 'settings-outline' as const,
      onPress: () => router.push('/settings'),
    },
    {
      label: 'Privacidade',
      icon: 'shield-checkmark-outline' as const,
      onPress: () => router.push('/profile/privacy'),
    },
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
    <View className="pt-5 pb-4 px-5 border-b border-line-subtle">
      <Text className="text-content font-bold text-lg">
        {profile.name} {profile.lastname}
      </Text>
      <Text className="text-content-muted text-sm mt-0.5">
        @{profile.username}
      </Text>
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      <ProfileEventsList
        events={events}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
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
            <View className="flex-row items-center gap-2 px-4 pb-3 pt-5">
              <Text className="text-content-secondary text-sm font-extrabold uppercase tracking-wide">
                Eventos
              </Text>
              {profile.eventsCount > 0 && (
                <Text className="text-content-subtle text-xs font-bold">
                  {profile.eventsCount}
                </Text>
              )}
            </View>
          </>
        }
      />
      <ProfileDrawer items={drawerItems} header={drawerHeader} />
    </View>
  )
}
