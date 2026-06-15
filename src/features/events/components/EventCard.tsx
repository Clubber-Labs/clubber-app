import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useToggleLike } from '../hooks/useToggleLike'
import { useSetAttendance, useCancelAttendance } from '../hooks/useAttendance'
import { EventCardHero } from './EventCardHero'
import { InlineCommentsSection } from './InlineCommentsSection'
import { EventAttendeesStack } from './EventAttendeesStack'
import { FeedReasonBanner } from './FeedReasonBanner'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatRelative, formatTime } from '@/shared/utils/dateFormat'
import { formatFullName } from '@/shared/utils/fullName'
import { featuredAttendees } from '@/shared/utils/featuredAttendees'
import type { FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: FeedEvent
  onPress: () => void
  // Banner de "amigo X" só faz sentido em contexto personalizado (/feed).
  // Em listagens genéricas (sem dado de amizade), passe false.
  showReason?: boolean
}

export function EventCard({ event, onPress, showReason = true }: Props) {
  const [expanded, setExpanded] = useState(false)
  const toggleLike = useToggleLike(event.id)
  const setAttendance = useSetAttendance(event.id)
  const cancelAttendance = useCancelAttendance(event.id)
  const navigateToProfile = useNavigateToProfile()

  const liked = event.userLiked
  const reason = showReason ? event.reason : null
  const hasImage = !!event.images[0]?.url
  const attendees = featuredAttendees(event)
  const going = event.userAttendance === 'CONFIRMED'
  const interested = event.userAttendance === 'INTERESTED'
  const rsvpPending = setAttendance.isPending || cancelAttendance.isPending

  function handleLike() {
    toggleLike.mutate(liked)
  }

  function handleGoing() {
    if (going) cancelAttendance.mutate()
    else setAttendance.mutate('CONFIRMED')
  }

  function handleInterested() {
    if (interested) cancelAttendance.mutate()
    else setAttendance.mutate('INTERESTED')
  }

  return (
    <View className="mb-3 overflow-hidden rounded-xl border border-line bg-surface">
      {/* self_created duplica o autor já exibido logo abaixo */}
      {reason && reason.kind !== 'self_created' && (
        <FeedReasonBanner reason={reason} />
      )}

      <Pressable onPress={onPress}>
        <EventCardHero
          event={event}
          onAuthorPress={() => navigateToProfile(event.author.id)}
        />

        <View className="gap-2 px-4 pt-3">
          {/* Com foto, a assinatura do autor já aparece sobreposta no hero;
              sem foto, o título está no hero e a assinatura vem aqui. */}
          {hasImage ? (
            <Text className="text-xl font-extrabold leading-tight text-content">
              {event.title}
            </Text>
          ) : (
            <Pressable
              onPress={() => navigateToProfile(event.author.id)}
              className="flex-row items-center gap-2 self-start py-0.5"
              accessibilityLabel={`Ver perfil de ${event.author.username}`}
            >
              <UserAvatar
                name={event.author.name}
                avatarUrl={event.author.avatarUrl}
                size={24}
              />
              <Text className="text-xs text-content-muted" numberOfLines={1}>
                <Text className="font-semibold text-content-secondary">
                  {formatFullName(event.author.name, event.author.lastname)}
                </Text>
                {`  ·  ${formatRelative(event.createdAt)}`}
              </Text>
            </Pressable>
          )}

          <View className="flex-row items-center gap-4">
            {!!event.address && (
              <View className="flex-1 flex-row items-center gap-1">
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.contentMuted}
                />
                <Text
                  className="flex-1 text-xs text-content-muted"
                  numberOfLines={1}
                >
                  {event.address}
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.contentMuted}
              />
              <Text className="text-xs text-content-muted">
                {formatTime(event.date)}
              </Text>
            </View>
          </View>
        </View>

        {attendees.length > 0 ? (
          <View className="px-4 pt-3">
            <EventAttendeesStack
              attendees={attendees}
              totalAttendances={event._count.attendances}
            />
          </View>
        ) : (
          event._count.attendances > 0 && (
            <View className="flex-row items-center gap-1.5 px-4 pt-3">
              <Ionicons
                name="people-outline"
                size={14}
                color={colors.contentMuted}
              />
              <Text className="text-xs text-content-muted">
                {event._count.attendances}{' '}
                {event._count.attendances === 1 ? 'pessoa vai' : 'pessoas vão'}
              </Text>
            </View>
          )
        )}
      </Pressable>

      {/* RSVP — a ação central acontece na própria descoberta */}
      <View className="flex-row gap-2 px-4 pt-3">
        <Pressable
          onPress={handleGoing}
          disabled={rsvpPending}
          accessibilityRole="button"
          accessibilityState={{ selected: going, busy: rsvpPending }}
          className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg ${
            going
              ? 'border border-brand-surface-strong bg-brand-surface'
              : 'bg-brand'
          }`}
        >
          <Ionicons
            name={going ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={18}
            color={going ? colors.brandTextBright : colors.content}
          />
          <Text
            className={`text-sm font-bold ${going ? 'text-brand-text-bright' : 'text-content'}`}
          >
            {going ? 'Confirmado' : 'Vou'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleInterested}
          disabled={rsvpPending}
          accessibilityRole="button"
          accessibilityLabel="Tenho interesse"
          accessibilityState={{ selected: interested, busy: rsvpPending }}
          className={`h-12 w-12 items-center justify-center rounded-lg ${
            interested
              ? 'border border-brand-surface-strong bg-brand-surface'
              : 'bg-surface-elevated'
          }`}
        >
          <Ionicons
            name={interested ? 'star' : 'star-outline'}
            size={20}
            color={
              interested ? colors.brandTextBright : colors.contentSecondary
            }
          />
        </Pressable>
      </View>

      {/* engajamento leve */}
      <View className="flex-row items-center gap-1 px-2 pt-1">
        <Pressable
          onPress={handleLike}
          disabled={toggleLike.isPending}
          className="flex-row items-center gap-1 rounded-full px-3 py-2"
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? colors.danger : colors.contentSecondary}
          />
          <Text
            className={`text-sm ${liked ? 'text-danger' : 'text-content-secondary'}`}
          >
            {event._count.reactions}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setExpanded(v => !v)}
          className="flex-row items-center gap-1 rounded-full px-3 py-2"
        >
          <Ionicons
            name={expanded ? 'chatbubble' : 'chatbubble-outline'}
            size={18}
            color={expanded ? colors.brandEmphasis : colors.contentSecondary}
          />
          <Text
            className={`text-sm ${expanded ? 'text-brand-text' : 'text-content-secondary'}`}
          >
            {event._count.comments}
          </Text>
        </Pressable>
      </View>

      {!expanded && (event.recentComments?.length ?? 0) > 0 && (
        <View className="gap-1 px-4 pb-3 pt-1">
          {event.recentComments.slice(0, 1).map(comment => (
            <View key={comment.id} className="flex-row">
              <Text className="text-sm font-semibold text-content">
                {comment.author.username}{' '}
              </Text>
              <Text
                className="flex-1 text-sm text-content-tertiary"
                numberOfLines={2}
              >
                {comment.content}
              </Text>
            </View>
          ))}
          {event._count.comments > 1 && (
            <Pressable onPress={() => setExpanded(true)}>
              <Text className="mt-0.5 text-xs text-content-subtle">
                Ver todos os {event._count.comments} comentários
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {expanded && <InlineCommentsSection eventId={event.id} />}
    </View>
  )
}
