import { useMemo } from 'react'
import { View, Text, Alert, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMyProfile, useUploadAvatar } from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { usePickAvatar } from '@/features/users/hooks/usePickAvatar'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { ProfileStats } from '@/features/users/components/ProfileStats'
import { ProfileEventsList } from '@/features/users/components/ProfileEventsList'
import { ProfileLoading } from '@/features/users/components/ProfileLoading'
import { ProfileEmpty } from '@/features/users/components/ProfileEmpty'

const NOT_IMPLEMENTED_TITLE = 'Em breve'
const NOT_IMPLEMENTED_BODY = 'Funcionalidade ainda não implementada.'

function notifyComingSoon() {
  Alert.alert(NOT_IMPLEMENTED_TITLE, NOT_IMPLEMENTED_BODY)
}

export default function ProfileScreen() {
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

  const events = useMemo(
    () => eventsData?.pages.flatMap(p => p.data) ?? [],
    [eventsData],
  )

  const handlePickAvatar = usePickAvatar(uri => uploadAvatar.mutate(uri))

  function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => performLogout() },
    ])
  }

  if (profileLoading) return <ProfileLoading />
  if (!profile) return <ProfileEmpty message="Não foi possível carregar o perfil." />

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
              onEditPress={notifyComingSoon}
            />
            <ProfileStats
              eventsCount={profile.eventsCount}
              followersCount={profile.followersCount}
              followingCount={profile.followingCount}
              onFollowersPress={notifyComingSoon}
              onFollowingPress={notifyComingSoon}
            />
            <View className="flex-row items-center justify-between mt-4 mb-3">
              <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Eventos
              </Text>
              <Pressable
                onPress={handleLogout}
                className="flex-row items-center gap-1 py-1"
                accessibilityLabel="Sair da conta"
              >
                <Ionicons name="log-out-outline" size={16} color="#a1a1aa" />
                <Text className="text-zinc-400 text-xs font-medium">Sair</Text>
              </Pressable>
            </View>
          </>
        }
      />
    </View>
  )
}
