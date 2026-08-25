import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { EventDetail } from '@/shared/types'
import { useEvent } from '@/features/events/hooks/useEvents'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { isForbiddenError } from '@/shared/lib/apiError'
import { EventHeader } from '@/features/events/components/EventHeader'
import { EventLocationMap } from '@/features/events/components/EventLocationMap'
import { EventAttendanceButton } from '@/features/events/components/EventAttendanceButton'
import { EventPostsFeed } from '@/features/events/components/EventPostsFeed'
import { EventActionsButton } from '@/features/events/components/EventActionsButton'
import { EventInviteButton } from '@/features/events/components/EventInviteButton'
import { EventShareButton } from '@/features/events/components/EventShareButton'
import { EventAnalyticsEntryCard } from '@/features/event-analytics/components/EventAnalyticsEntryCard'
import { PromoteEventCard } from '@/features/featured-events/components/PromoteEventCard'
import { useTrackEventView } from '@/features/event-analytics/hooks/useTrackEventView'
import { useTrackEventShare } from '@/features/event-analytics/hooks/useTrackEventShare'
import { ReportButton } from '@/features/reports/components/ReportButton'
import { colors } from '@/shared/theme'

type HeaderProps = {
  event: EventDetail
  isAuthor: boolean
  isPremium: boolean
  onShared: () => void
}

function DetailHeader({ event, isAuthor, isPremium, onShared }: HeaderProps) {
  const allowAttendance = event.status !== 'PAST' && event.status !== 'CANCELED'
  // Privado: só o autor convida. Público: qualquer um. Evento encerrado ou
  // cancelado não recebe convite — mesma janela do RSVP.
  const canInvite = (isAuthor || event.isPublic) && allowAttendance
  const router = useRouter()

  return (
    <View>
      <EventHeader
        event={event}
        onBack={() => router.back()}
        actions={
          <View className="flex-row items-center gap-2">
            {isAuthor && (
              <EventShareButton
                eventId={event.id}
                title={event.title}
                onShared={onShared}
              />
            )}
            {isAuthor ? (
              <EventActionsButton eventId={event.id} />
            ) : (
              <ReportButton
                target={{ type: 'event', id: event.id }}
                variant="overlay"
              />
            )}
          </View>
        }
      />
      <View className="gap-5 pt-5 pb-5">
        {isAuthor && (
          <EventAnalyticsEntryCard eventId={event.id} isPremium={isPremium} />
        )}
        {isAuthor && (
          <PromoteEventCard
            eventId={event.id}
            eventDate={event.date}
            isPremium={isPremium}
            isFeatured={!!event.isFeatured}
          />
        )}
        {(allowAttendance || canInvite) && (
          <View className="gap-2">
            {allowAttendance && (
              <EventAttendanceButton
                eventId={event.id}
                current={event.userAttendance}
              />
            )}
            {canInvite && <EventInviteButton eventId={event.id} />}
          </View>
        )}
        <EventLocationMap event={event} />
      </View>
      <View className="border-t border-line" />
    </View>
  )
}

export default function EventDetailScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const userId = useAuthStore(state => state.userId)
  const { data: event, isLoading, isError, error } = useEvent(id)
  const { data: profile } = useMyProfile()
  const { mutate: trackView } = useTrackEventView(id)
  const { mutate: trackShare } = useTrackEventShare(id)

  // Registra a visualização só depois que o evento carrega com sucesso (não
  // conta 403/404/loading). Guard por id: o cache de detalhe é mutado por
  // likes/presença otimistas, então sem ele o efeito re-dispararia a cada
  // interação, inflando as visualizações.
  const trackedEventId = useRef<string | null>(null)
  useEffect(() => {
    if (event && trackedEventId.current !== event.id) {
      trackedEventId.current = event.id
      trackView()
    }
  }, [event, trackView])

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  if (isForbiddenError(error)) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6 gap-3">
        <Text className="text-content font-semibold text-base text-center">
          {t('events.detail.unavailable')}
        </Text>
        <Text className="text-content-muted text-center text-sm">
          {t('events.detail.privateNotice')}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-brand-text font-semibold mt-2">
            {t('common.back')}
          </Text>
        </Pressable>
      </View>
    )
  }

  if (isError || !event) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6 gap-3">
        <Text className="text-content-secondary text-center">
          {t('events.detail.loadError')}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-brand-text font-semibold">
            {t('common.back')}
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <EventPostsFeed
        eventId={event.id}
        myAttendance={event.userAttendance}
        ListHeaderComponent={
          <DetailHeader
            event={event}
            isAuthor={event.authorId === userId}
            isPremium={!!profile?.isPremium}
            onShared={() => trackShare()}
          />
        }
      />
    </KeyboardAvoidingView>
  )
}
