import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatRelative } from '@/shared/utils/dateFormat'
import type { AppNotification } from '../schemas/notificationSchema'

type Props = {
  notification: AppNotification
  onPress: (notification: AppNotification) => void
}

export function NotificationRow({ notification, onPress }: Props) {
  const { title, body, createdAt, readAt, data } = notification
  const actor = data?.actor
  const unread = readAt === null

  return (
    <Pressable
      onPress={() => onPress(notification)}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-zinc-900 active:bg-zinc-950"
    >
      {actor ? (
        <UserAvatar
          name={actor.name}
          avatarUrl={actor.avatarUrl ?? null}
          size={40}
        />
      ) : (
        <View className="w-10 h-10 rounded-full bg-violet-950 items-center justify-center">
          <Ionicons name="location" size={20} color="#a78bfa" />
        </View>
      )}

      <View className="flex-1">
        <Text
          className={`text-sm ${unread ? 'text-white font-semibold' : 'text-zinc-300'}`}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-sm text-zinc-400" numberOfLines={2}>
          {body}
        </Text>
        <Text className="text-xs text-zinc-500 mt-0.5">
          {formatRelative(createdAt)}
        </Text>
      </View>

      {unread && <View className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
    </Pressable>
  )
}
