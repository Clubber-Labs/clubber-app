import { useCallback, useEffect, useMemo } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBanner } from '@/shared/lib/banner'
import {
  getApiError,
  isNotFoundError,
  isUnauthorizedError,
} from '@/shared/lib/apiError'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import { useUserProfile } from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { useFollowUser } from '@/features/users/hooks/useFollowUser'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { ProfileMusicSection } from '@/features/spotify/components/ProfileMusicSection'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { FollowButton } from '@/features/users/components/FollowButton'
import { MessageButton } from '@/features/users/components/MessageButton'
import { ProfileEventsList } from '@/features/users/components/ProfileEventsList'
import { ProfileEventsSectionTitle } from '@/features/users/components/ProfileEventsSectionTitle'
import { ProfileEventsEmpty } from '@/features/users/components/ProfileEventsEmpty'
import { ProfileLoading } from '@/features/users/components/ProfileLoading'
import { ProfileEmpty } from '@/features/users/components/ProfileEmpty'
import { ReportButton } from '@/features/reports/components/ReportButton'

export default function UserProfileScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const showBanner = useBanner()
  const viewerId = useAuthStore(s => s.userId)
  const isOwnProfile = viewerId === id

  // /users/:id não retorna campos privados (email/phone) — vai pra Meu Perfil
  useEffect(() => {
    if (isOwnProfile) router.replace('/(tabs)/profile')
  }, [isOwnProfile, router])

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile(id)
  const canSeeContent =
    isOwnProfile || !profile?.isPrivate || profile?.followStatus === 'ACCEPTED'
  const eventsQuery = useUserEvents(id, canSeeContent)
  const { follow, unfollow } = useFollowUser(id)
  const createConversation = useCreateConversation()
  // refetch ignora o `enabled` da query: sem acesso ao conteúdo (perfil
  // privado), forçar a vitrine bateria num endpoint que vai negar.
  const { refetch: refetchEvents } = eventsQuery
  const refreshAll = useCallback(
    () =>
      Promise.all([
        refetchProfile(),
        ...(canSeeContent ? [refetchEvents()] : []),
      ]),
    [refetchProfile, refetchEvents, canSeeContent],
  )
  const { refreshing, onRefresh } = usePullRefresh(refreshAll)

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
        showBanner(t('profile.notFoundBanner'))
        router.back()
        return
      }
      // 403 (privado / bloqueio) e demais: mostra a `message` do servidor.
      showBanner(getApiError(e).message)
    }
  }

  if (profileLoading) return <ProfileLoading />
  if (!profile) return <ProfileEmpty message={t('profile.notFound')} />

  // Pré-validação (UX) espelhando o canChatWith do backend: público é livre,
  // privado exige follow MÚTUO. Bloqueio o client não sabe; fica pro 403 do POST.
  const canMessage =
    !profile.isPrivate ||
    (profile.followStatus === 'ACCEPTED' && profile.followsYou === true)

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
        ownerId={id}
        hasNextPage={eventsQuery.hasNextPage ?? false}
        isFetchingNextPage={eventsQuery.isFetchingNextPage}
        isLoading={eventsQuery.isLoading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        // Sem vitrine à vista o refresh atualiza só o header: o spinner gira
        // normal, mas a grade não pisca fantasma de uma lista que não vem.
        showSkeletonOnRefresh={canSeeContent}
        onLoadMore={eventsQuery.fetchNextPage}
        empty={
          <ProfileEventsEmpty variant={canSeeContent ? 'other' : 'private'} />
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
                  match={profile.artistMatch}
                />
              }
              isOwnProfile={isOwnProfile}
              onFollowersPress={() =>
                router.push(`/users/${profile.id}/followers`)
              }
              onFollowingPress={() =>
                router.push(`/users/${profile.id}/following`)
              }
              actions={
                !isOwnProfile ? (
                  <View className="flex-row items-center gap-2">
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
                ) : undefined
              }
            />
            <ProfileEventsSectionTitle />
          </>
        }
      />
    </View>
  )
}
