import { useState } from 'react'
import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useToggleLike } from '../hooks/useToggleLike'
import { InlineCommentsSection } from './InlineCommentsSection'
import { FriendAttendancesStack } from './FriendAttendancesStack'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { FeedReasonBanner } from './FeedReasonBanner'
import { computeFeedReason } from '../utils/feedReason'
import { useAuthStore } from '@/features/auth/store/authStore'
import { showError } from '@/shared/lib/toast'
import { formatRelative } from '@/shared/utils/dateFormat'
import type { FeedEvent } from '@/shared/types'

type Props = {
  event: FeedEvent
  onPress: () => void
}

export function EventCard({ event, onPress }: Props) {
  const [expanded, setExpanded] = useState(false)
  const toggleLike = useToggleLike(event.id)
  const userId = useAuthStore(s => s.userId)

  const liked = event.userReaction === 'LIKE'
  const reason = computeFeedReason(event, userId)
  const showReason =
    !!reason && event.userAttendance === null && event.userReaction === null

  function handleLike() {
    toggleLike.mutate(event.userReaction, { onError: showError })
  }

  return (
    <View className="bg-zinc-900 rounded-2xl mb-3 border border-zinc-800 overflow-hidden">
      {showReason && <FeedReasonBanner reason={reason} />}
      <Pressable onPress={onPress}>
        <View className="flex-row items-center justify-between px-4 pt-4">
          <View className="flex-row items-center gap-2">
            <View className="w-9 h-9 rounded-full bg-violet-900 items-center justify-center">
              <Text className="text-violet-300 font-semibold">
                {event.author.name[0]?.toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-white">
                {event.author.name} {event.author.lastname}
              </Text>
              <Text className="text-xs text-zinc-500">
                {formatRelative(event.createdAt)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5">
            <AttendanceStatusBadge attendance={event.userAttendance} />
            {!event.isPublic && (
              <View className="bg-zinc-800 px-2 py-0.5 rounded-full">
                <Text className="text-xs text-zinc-400">Privado</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-4 pt-3 gap-1">
          <Text className="text-base font-bold text-white">{event.title}</Text>
          {event.description && (
            <Text className="text-sm text-zinc-400" numberOfLines={2}>
              {event.description}
            </Text>
          )}
        </View>

        {event.imageUrl && (
          <Image
            source={{ uri: event.imageUrl }}
            className="w-full h-48 mt-3 bg-zinc-800"
            resizeMode="cover"
          />
        )}

        <View className="flex-row items-center gap-4 px-4 pt-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
            <Text className="text-xs text-zinc-400">
              {new Date(event.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={14} color="#9ca3af" />
            <Text className="text-xs text-zinc-400">
              {event._count.attendances} indo
            </Text>
          </View>
        </View>

        {event.friendAttendances.length > 0 && (
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
          className="flex-row items-center gap-1 px-3 py-2 rounded-full"
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#ef4444' : '#e5e7eb'}
          />
          <Text
            className={`text-sm ${liked ? 'text-red-500' : 'text-zinc-200'}`}
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
            color={expanded ? '#8b5cf6' : '#e5e7eb'}
          />
          <Text
            className={`text-sm ${expanded ? 'text-violet-400' : 'text-zinc-200'}`}
          >
            {event._count.comments}
          </Text>
        </Pressable>

      </View>

      {!expanded && (event.recentComments?.length ?? 0) > 0 && (
        <View className="px-4 pt-1 pb-3 gap-1">
          {event.recentComments.slice(0, 1).map(comment => (
            <View key={comment.id} className="flex-row">
              <Text className="text-sm text-white font-semibold">
                {comment.author.username}{' '}
              </Text>
              <Text className="text-sm text-zinc-300 flex-1" numberOfLines={2}>
                {comment.content}
              </Text>
            </View>
          ))}
          {event._count.comments > 1 && (
            <Pressable onPress={() => setExpanded(true)}>
              <Text className="text-xs text-zinc-500 mt-0.5">
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
