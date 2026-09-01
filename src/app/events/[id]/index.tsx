import { useEffect, useRef, useState } from 'react'
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
import { ChatCircleIcon } from 'phosphor-react-native'
import { CommentsSheet } from '@/features/events/components/comments/CommentsSheet'
import type { EventDetail } from '@/shared/types'
import { useEvent } from '@/features/events/hooks/useEvents'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { isForbiddenError } from '@/shared/lib/apiError'
import { EventHeader } from '@/features/events/components/EventHeader'
import { EventLocationMap } from '@/features/events/components/EventLocationMap'
import { EventPostsFeed } from '@/features/events/components/EventPostsFeed'
import { EventActionsButton } from '@/features/events/components/EventActionsButton'
import { EventTicketCard } from '@/features/events/components/detail/EventTicketCard'
import { EventRsvpRow } from '@/features/events/components/detail/EventRsvpRow'
import { EventInviteCard } from '@/features/events/components/detail/EventInviteCard'
import { EventCheckInCard } from '@/features/events/components/detail/EventCheckInCard'
import { EventCheckInSummary } from '@/features/events/components/detail/EventCheckInSummary'
import { EventPromotionSection } from '@/features/events/components/detail/EventPromotionSection'
import { EventAttendeesSection } from '@/features/events/components/detail/EventAttendeesSection'
import { useTrackEventView } from '@/features/event-analytics/hooks/useTrackEventView'
import { useTrackEventShare } from '@/features/event-analytics/hooks/useTrackEventShare'
import { ReportButton } from '@/features/reports/components/ReportButton'
import { colors } from '@/shared/theme'

type HeaderProps = {
  event: EventDetail
  isAuthor: boolean
  isPremium: boolean
  onShared: () => void
  onOpenComments: () => void
}

function DetailHeader({
  event,
  isAuthor,
  isPremium,
  onShared,
  onOpenComments,
}: HeaderProps) {
  const { t } = useTranslation()
  const allowAttendance = event.status !== 'PAST' && event.status !== 'CANCELED'
  // Privado: só o autor convida. Público: qualquer um. Evento encerrado ou
  // cancelado não recebe convite — mesma janela do RSVP.
  const canInvite = (isAuthor || event.isPublic) && allowAttendance
  const isLive = event.status === 'ONGOING'
  const router = useRouter()

  // O ingresso ancora o topo pra quem organiza (não há RSVP a responder) e cai
  // abaixo da resposta pra quem foi convidado — a decisão vem primeiro.
  const ticket = <EventTicketCard event={event} />
  const rsvp = (
    <EventRsvpRow
      eventId={event.id}
      current={event.userAttendance}
      canInvite={canInvite}
    />
  )

  return (
    <View>
      <EventHeader
        event={event}
        onBack={() => router.back()}
        actions={
          isAuthor ? (
            <EventActionsButton eventId={event.id} />
          ) : (
            <ReportButton target={{ type: 'event', id: event.id }} />
          )
        }
      />
      <View className="gap-5 pt-5 pb-5">
        {isAuthor && ticket}

        {!isAuthor &&
          allowAttendance &&
          (event.viewerInvite ? (
            <EventInviteCard invite={event.viewerInvite}>
              {rsvp}
            </EventInviteCard>
          ) : (
            rsvp
          ))}

        {isLive &&
          event.checkIns &&
          (isAuthor ? (
            <EventCheckInSummary
              checkIns={event.checkIns}
              confirmedCount={event._count.attendances}
            />
          ) : (
            <EventCheckInCard
              eventId={event.id}
              venueName={event.venueName}
              checkIns={event.checkIns}
            />
          ))}

        {!isAuthor && ticket}

        {!!event.description && (
          <Text className="text-content-secondary text-[15px] leading-6">
            {event.description}
          </Text>
        )}

        {isAuthor && (
          <EventPromotionSection
            event={event}
            isPremium={isPremium}
            onShared={onShared}
          />
        )}

        <EventAttendeesSection event={event} />
        <EventLocationMap event={event} />

        {/* A conversa do evento vive no drawer, igual ao card do feed — é a
            mesma lista, e é onde o deep-link de resposta aterrissa. */}
        <Pressable
          onPress={onOpenComments}
          accessibilityRole="button"
          className="flex-row items-center gap-2"
        >
          <ChatCircleIcon size={20} color={colors.contentSecondary} />
          <Text className="text-[15px] font-semibold text-content-secondary">
            {event._count.comments > 0
              ? t('events.comments.viewAll', {
                  count: event._count.comments,
                })
              : t('events.comments.composerPlaceholder')}
          </Text>
        </Pressable>
      </View>
      <View className="border-t border-line" />
    </View>
  )
}

export default function EventDetailScreen() {
  const { t } = useTranslation()
  // `thread`/`highlight` chegam do tap numa notificação de resposta: a raiz já
  // resolvida e a resposta a destacar. `post` diz que a conversa é a de um
  // post do evento, não a do evento.
  const { id, thread, highlight, post } = useLocalSearchParams<{
    id: string
    thread?: string
    highlight?: string
    post?: string
  }>()
  const router = useRouter()
  const [commentsOpen, setCommentsOpen] = useState(false)
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

  // Chegou por notificação de resposta: a conversa abre sozinha na thread
  // apontada. Só na ida — fechar o drawer não pode reabri-lo.
  const openedFromLink = useRef(false)
  useEffect(() => {
    if (!thread || openedFromLink.current) return
    openedFromLink.current = true
    setCommentsOpen(true)
  }, [thread])

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

  const isAuthor = event.authorId === userId

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <EventPostsFeed
        eventId={event.id}
        myAttendance={event.userAttendance}
        isAuthor={isAuthor}
        // Evento ao vivo muda o convite do input: não é "conte sobre o
        // evento", é "mostre o que está rolando agora".
        placeholder={
          event.status === 'ONGOING'
            ? t('events.posts.placeholderLive')
            : undefined
        }
        ListHeaderComponent={
          <DetailHeader
            event={event}
            isAuthor={isAuthor}
            isPremium={!!profile?.isPremium}
            onShared={() => trackShare()}
            onOpenComments={() => setCommentsOpen(true)}
          />
        }
      />

      {commentsOpen && (
        <CommentsSheet
          visible
          onClose={() => setCommentsOpen(false)}
          target={
            post
              ? { kind: 'post', postId: post }
              : { kind: 'event', eventId: event.id }
          }
          isOrganizer={isAuthor}
          focusRootId={thread}
          focusReplyId={highlight}
        />
      )}
    </KeyboardAvoidingView>
  )
}
