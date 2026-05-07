import { useMemo } from 'react'
import { View, Text, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useUserProfile } from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { useFollowUser } from '@/features/users/hooks/useFollowUser'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { ProfileStats } from '@/features/users/components/ProfileStats'
import { FollowButton } from '@/features/users/components/FollowButton'
import { ProfileEventsList } from '@/features/users/components/ProfileEventsList'
import { ProfileLoading } from '@/features/users/components/ProfileLoading'
import { ProfileEmpty } from '@/features/users/components/ProfileEmpty'

function notifyComingSoon() {
  Alert.alert('Em breve', 'Funcionalidade ainda não implementada.')
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const viewerId = useAuthStore(s => s.userId)
  const isOwnProfile = viewerId === id

  const { data: profile, isLoading: profileLoading } = useUserProfile(id)
  const {
    data: eventsData,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage,
  } = useUserEvents(id)
  const { follow, unfollow } = useFollowUser(id)

  const events = useMemo(
    () => eventsData?.pages.flatMap(p => p.data) ?? [],
    [eventsData],
  )

  if (profileLoading) return <ProfileLoading />
  if (!profile) return <ProfileEmpty message="Usuário não encontrado." />

  return (
    <View className="flex-1 bg-black">
      <ProfileEventsList
        events={events}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        header={
          <>
            <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
            {!isOwnProfile && (
              <View className="mt-3 mb-1">
                <FollowButton
                  status={profile.followStatus ?? null}
                  loading={follow.isPending || unfollow.isPending}
                  onFollow={() => follow.mutate()}
                  onUnfollow={() => unfollow.mutate()}
                />
              </View>
            )}
            <ProfileStats
              eventsCount={profile.eventsCount}
              followersCount={profile.followersCount}
              followingCount={profile.followingCount}
              onFollowersPress={notifyComingSoon}
              onFollowingPress={notifyComingSoon}
            />
            <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-4 mb-3">
              Eventos
            </Text>
          </>
        }
      />
    </View>
  )
}
