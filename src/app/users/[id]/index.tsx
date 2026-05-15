import { useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
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

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const viewerId = useAuthStore(s => s.userId)
  const isOwnProfile = viewerId === id

  // /users/:id não retorna campos privados (email/phone) — vai pra Meu Perfil
  useEffect(() => {
    if (isOwnProfile) router.replace('/(tabs)/profile')
  }, [isOwnProfile, router])

  const { data: profile, isLoading: profileLoading } = useUserProfile(id)
  const canSeeContent =
    isOwnProfile ||
    !profile?.isPrivate ||
    profile?.followStatus === 'ACCEPTED'
  const eventsQuery = useUserEvents(id, canSeeContent)
  const { follow, unfollow } = useFollowUser(id)

  const events = useMemo(
    () => eventsQuery.data?.pages.flatMap(p => p.data) ?? [],
    [eventsQuery.data],
  )

  if (profileLoading) return <ProfileLoading />
  if (!profile) return <ProfileEmpty message="Usuário não encontrado." />

  return (
    <View className="flex-1 bg-black">
      <ProfileEventsList
        events={events}
        hasNextPage={eventsQuery.hasNextPage ?? false}
        isFetchingNextPage={eventsQuery.isFetchingNextPage}
        onLoadMore={eventsQuery.fetchNextPage}
        emptyMessage={
          !canSeeContent
            ? 'Este perfil é privado. Siga para ver os eventos.'
            : 'Nenhum evento ainda.'
        }
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
              onFollowersPress={() =>
                router.push(`/users/${profile.id}/followers`)
              }
              onFollowingPress={() =>
                router.push(`/users/${profile.id}/following`)
              }
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
