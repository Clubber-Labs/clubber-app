import { useState } from 'react'
import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useToggleLike } from '../hooks/useToggleLike'
import { InlineCommentsSection } from './InlineCommentsSection'
import { FriendAttendancesStack } from './FriendAttendancesStack'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { EventStatusBadge } from './EventStatusBadge'
import { FeedReasonBanner } from './FeedReasonBanner'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatRelative } from '@/shared/utils/dateFormat'
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
  const navigateToProfile = useNavigateToProfile()

  const liked = event.userLiked
  const reason = showReason ? event.reason : null

  function handleLike() {
    toggleLike.mutate(liked)
  }

  return (
    <View className="bg-surface rounded-2xl mb-3 border border-line overflow-hidden">
      {/* self_created duplica o autor já exibido logo abaixo */}
      {reason && reason.kind !== 'self_created' && (
        <FeedReasonBanner reason={reason} />
      )}
      <Pressable onPress={onPress}>
        <View className="flex-row items-center justify-between px-4 pt-4">
          <Pressable
            onPress={() => navigateToProfile(event.author.id)}
            className="flex-row items-center gap-2"
            accessibilityLabel={`Ver perfil de ${event.author.username}`}
          >
            <UserAvatar
              name={event.author.name}
              avatarUrl={event.author.avatarUrl}
            />
            <View>
              <Text className="text-sm font-semibold text-content">
                {event.author.name} {event.author.lastname}
              </Text>
              <Text className="text-xs text-content-subtle">
                {formatRelative(event.createdAt)}
              </Text>
            </View>
          </Pressable>
          <View className="flex-row items-center gap-1.5">
            <EventStatusBadge status={event.status} date={event.date} />
            <AttendanceStatusBadge attendance={event.userAttendance} />
            {!event.isPublic && (
              <View className="bg-surface-elevated px-2 py-0.5 rounded-full">
                <Text className="text-xs text-content-muted">Privado</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-4 pt-3 gap-1">
          <Text className="text-base font-bold text-content">
            {event.title}
          </Text>
          {event.description && (
            <Text className="text-sm text-content-muted" numberOfLines={2}>
              {event.description}
            </Text>
          )}
        </View>

        {event.images[0] && (
          <Image
            source={{ uri: event.images[0].url }}
            className="w-full h-48 mt-3 bg-surface-elevated"
            resizeMode="cover"
          />
        )}

        <View className="flex-row items-center gap-4 px-4 pt-3">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.contentMuted}
            />
            <Text className="text-xs text-content-muted">
              {new Date(event.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="people-outline"
              size={14}
              color={colors.contentMuted}
            />
            <Text className="text-xs text-content-muted">
              {event._count.attendances} indo
            </Text>
          </View>
        </View>

        {event.friendAttendances && event.friendAttendances.length > 0 && (
          <View className="px-4 pt-2">
            <FriendAttendancesStack
              attendances={event.friendAttendances}
              totalAttendances={event._count.attendances}
            />
          </View>
        )}
      </Pressable>

      <View className="flex-row items-center gap-1 px-2 pt-2">
        <Pressable
          onPress={handleLike}
          disabled={toggleLike.isPending}
          className="flex-row items-center gap-1 px-3 py-2 rounded-full"
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
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
          className="flex-row items-center gap-1 px-3 py-2 rounded-full"
        >
          <Ionicons
            name={expanded ? 'chatbubble' : 'chatbubble-outline'}
            size={20}
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
        <View className="px-4 pt-1 pb-3 gap-1">
          {event.recentComments.slice(0, 1).map(comment => (
            <View key={comment.id} className="flex-row">
              <Text className="text-sm text-content font-semibold">
                {comment.author.username}{' '}
              </Text>
              <Text
                className="text-sm text-content-tertiary flex-1"
                numberOfLines={2}
              >
                {comment.content}
              </Text>
            </View>
          ))}
          {event._count.comments > 1 && (
            <Pressable onPress={() => setExpanded(true)}>
              <Text className="text-xs text-content-subtle mt-0.5">
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
