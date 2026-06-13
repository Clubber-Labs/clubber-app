import { useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBanner } from '@/shared/lib/banner'
import {
  getApiError,
  isNotFoundError,
  isUnauthorizedError,
} from '@/shared/lib/apiError'
import { useUserProfile } from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { useFollowUser } from '@/features/users/hooks/useFollowUser'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { ProfileStats } from '@/features/users/components/ProfileStats'
import { FollowButton } from '@/features/users/components/FollowButton'
import { MessageButton } from '@/features/users/components/MessageButton'
import { ProfileEventsList } from '@/features/users/components/ProfileEventsList'
import { ProfileLoading } from '@/features/users/components/ProfileLoading'
import { ProfileEmpty } from '@/features/users/components/ProfileEmpty'
import { ReportButton } from '@/features/reports/components/ReportButton'

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const showBanner = useBanner()
  const viewerId = useAuthStore(s => s.userId)
  const isOwnProfile = viewerId === id

  // /users/:id não retorna campos privados (email/phone) — vai pra Meu Perfil
  useEffect(() => {
    if (isOwnProfile) router.replace('/(tabs)/profile')
  }, [isOwnProfile, router])

  const { data: profile, isLoading: profileLoading } = useUserProfile(id)
  const canSeeContent =
    isOwnProfile || !profile?.isPrivate || profile?.followStatus === 'ACCEPTED'
  const eventsQuery = useUserEvents(id, canSeeContent)
  const { follow, unfollow } = useFollowUser(id)
  const createConversation = useCreateConversation()

  const events = useMemo(
    () => eventsQuery.data?.pages.flatMap(p => p.data) ?? [],
    [eventsQuery.data],
  )

  async function openConversation() {
    if (createConversation.isPending) return
    try {
      // DM idempotente: reabre a existente se já houver. Navega pra conversa.
      const conv = await createConversation.mutateAsync({
        type: 'DIRECT',
        targetUserId: id,
      })
      // 200 (já existia) ou 201 (criada): o axios resolve em ambos.
      router.push(`/conversations/${conv.id}`)
    } catch (e) {
      // Backend é a fonte de verdade — trata por STATUS, não por texto. Cobre o
      // bloqueio, que o client não consegue prever na pré-validação.
      if (isUnauthorizedError(e)) return // 401 → interceptor cuida da sessão
      if (isNotFoundError(e)) {
        showBanner('Usuário não encontrado')
        router.back()
        return
      }
      // 403 (privado / bloqueio) e demais: mostra a `message` do servidor.
      showBanner(getApiError(e).message)
    }
  }

  if (profileLoading) return <ProfileLoading />
  if (!profile) return <ProfileEmpty message="Usuário não encontrado." />

  // Pré-validação (UX): só libera DM se o alvo é público OU você o segue (aceito)
  // — direção VOCÊ→alvo. Bloqueio o client não sabe; fica pro 403 do POST.
  const canMessage = !profile.isPrivate || profile.followStatus === 'ACCEPTED'

  const followButton = (
    <FollowButton
      status={profile.followStatus ?? null}
      loading={follow.isPending || unfollow.isPending}
      onFollow={() => follow.mutate()}
      onUnfollow={() => unfollow.mutate()}
    />
  )

  return (
    <View className="flex-1 bg-background">
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
              <View className="mt-3 mb-1 flex-row items-center gap-2">
                <View className="flex-1">{followButton}</View>
                {canMessage && (
                  <MessageButton
                    onPress={openConversation}
                    loading={createConversation.isPending}
                  />
                )}
                <ReportButton
                  target={{ type: 'user', id: profile.id }}
                  variant="ghost"
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
            <Text className="text-content-muted text-xs font-semibold uppercase tracking-wider mt-4 mb-3">
              Eventos
            </Text>
          </>
        }
      />
    </View>
  )
}
