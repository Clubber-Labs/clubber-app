import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatRelative } from '@/shared/utils/dateFormat'
import type { AppNotification } from '../schemas/notificationSchema'
import { colors } from '@/shared/theme'

type Props = {
  notification: AppNotification
  onPress: (notification: AppNotification) => void
}

export function NotificationRow({ notification, onPress }: Props) {
  const { type, title, body, createdAt, readAt, data } = notification
  const actor = data?.actor
  const unread = readAt === null
  // Sem actor no payload, o ícone segue o domínio: spots usam a mesma
  // iconografia do "gerar rolê"; o resto mantém o pino de proximidade.
  const fallbackIcon = type.startsWith('SPOT_') ? 'sparkles' : 'location'

  return (
    <Pressable
      onPress={() => onPress(notification)}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-line-subtle active:bg-surface-sunken"
    >
      {actor ? (
        <UserAvatar
          name={actor.name}
          avatarUrl={actor.avatarUrl ?? null}
          size={40}
        />
      ) : (
        <View className="w-10 h-10 rounded-full bg-brand-surface items-center justify-center">
          <Ionicons name={fallbackIcon} size={20} color={colors.brandText} />
        </View>
      )}

      <View className="flex-1">
        <Text
          className={`text-sm ${unread ? 'text-content font-semibold' : 'text-content-tertiary'}`}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-sm text-content-muted" numberOfLines={2}>
          {body}
        </Text>
        <Text className="text-xs text-content-subtle mt-0.5">
          {formatRelative(createdAt)}
        </Text>
      </View>

      {unread && (
        <View className="w-2.5 h-2.5 rounded-full bg-brand-emphasis" />
      )}
    </Pressable>
  )
}
