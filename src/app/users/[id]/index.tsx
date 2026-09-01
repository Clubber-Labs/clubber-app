import { useEffect, useMemo, useState } from 'react'
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
import { useUserProfile } from '@/features/users/hooks/useProfile'
import { useUserEvents } from '@/features/users/hooks/useUserEvents'
import { useUserPhotos } from '@/features/users/hooks/useUserPhotos'
import { useFollowUser } from '@/features/users/hooks/useFollowUser'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { ProfileMusicSection } from '@/features/spotify/components/ProfileMusicSection'
import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { ProfileActions } from '@/features/users/components/ProfileActions'
import { ProfileStage } from '@/features/users/components/ProfileStage'
import { ProfilePhotoViewer } from '@/features/users/components/ProfilePhotoViewer'
import { ProfileLoading } from '@/features/users/components/ProfileLoading'
import { ProfileEmpty } from '@/features/users/components/ProfileEmpty'

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

  const { data: profile, isLoading: profileLoading } = useUserProfile(id)
  const canSeeContent =
    isOwnProfile || !profile?.isPrivate || profile?.followStatus === 'ACCEPTED'
  // Sem acesso ao conteúdo (perfil privado), as listas batem em endpoints que
  // vão negar — ficam desligadas.
  const eventsQuery = useUserEvents(id, canSeeContent)
  const photosQuery = useUserPhotos(id, canSeeContent)
  const { follow, unfollow } = useFollowUser(id)
  const createConversation = useCreateConversation()
  const [viewerPhotoId, setViewerPhotoId] = useState<string | null>(null)

  const events = useMemo(
    () => eventsQuery.data?.pages.flatMap(p => p.data) ?? [],
    [eventsQuery.data],
  )
  const photos = useMemo(
    () => photosQuery.data?.pages.flatMap(p => p.data) ?? [],
    [photosQuery.data],
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

  return (
    <View className="flex-1 bg-background">
      <ProfileStage
        ownerId={id}
        isOwnProfile={isOwnProfile}
        locked={!canSeeContent}
        header={
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
                <ProfileActions
                  profile={profile}
                  followLoading={follow.isPending || unfollow.isPending}
                  onFollow={() => follow.mutate()}
                  onUnfollow={() => unfollow.mutate()}
                  onMessage={canMessage ? openConversation : undefined}
                  messageLoading={createConversation.isPending}
                />
              ) : undefined
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
      />

      <ProfilePhotoViewer
        photos={photos}
        photoId={viewerPhotoId}
        isOwner={false}
        onClose={() => setViewerPhotoId(null)}
        onDelete={() => {}}
        onOpenEvent={eventId => router.push(`/events/${eventId}`)}
      />
    </View>
  )
}
