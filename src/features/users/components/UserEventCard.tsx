import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCategories } from '@/shared/hooks/useCategories'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: UserEventSummary
  onPress: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function UserEventCard({ event, onPress }: Props) {
  const { labelsFor } = useCategories()
  return (
    <Pressable
      onPress={onPress}
      className="flex-row bg-surface rounded-xl overflow-hidden mb-3"
    >
      {event.images[0] ? (
        <Image
          source={{ uri: event.images[0].url }}
          className="w-24 h-24"
          resizeMode="cover"
        />
      ) : (
        <View className="w-24 h-24 bg-surface-elevated items-center justify-center">
          <Ionicons
            name="calendar-outline"
            size={28}
            color={colors.contentFaint}
          />
        </View>
      )}

      <View className="flex-1 px-3 py-3 justify-between">
        <Text className="text-content font-semibold text-sm" numberOfLines={2}>
          {event.title}
        </Text>
        <View className="gap-1">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="time-outline"
              size={12}
              color={colors.contentMuted}
            />
            <Text className="text-content-muted text-xs">
              {formatDate(event.date)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="grid-outline"
              size={12}
              color={colors.contentMuted}
            />
            <Text className="text-content-muted text-xs">
              {labelsFor(event.categories)}
            </Text>
          </View>
          {typeof event.attendancesCount === 'number' && (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="people-outline"
                size={12}
                color={colors.contentMuted}
              />
              <Text className="text-content-muted text-xs">
                {event.attendancesCount} participantes
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}
