import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { UserEventSummary } from '@/shared/types'

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
  return (
    <Pressable
      onPress={onPress}
      className="flex-row bg-zinc-900 rounded-xl overflow-hidden mb-3"
    >
      {event.imageUrl ? (
        <Image
          source={{ uri: event.imageUrl }}
          className="w-24 h-24"
          resizeMode="cover"
        />
      ) : (
        <View className="w-24 h-24 bg-zinc-800 items-center justify-center">
          <Ionicons name="calendar-outline" size={28} color="#52525b" />
        </View>
      )}

      <View className="flex-1 px-3 py-3 justify-between">
        <Text className="text-white font-semibold text-sm" numberOfLines={2}>
          {event.title}
        </Text>
        <View className="gap-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#a1a1aa" />
            <Text className="text-zinc-400 text-xs">{formatDate(event.date)}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="grid-outline" size={12} color="#a1a1aa" />
            <Text className="text-zinc-400 text-xs capitalize">{event.category.toLowerCase()}</Text>
          </View>
          {typeof event.attendancesCount === 'number' && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="people-outline" size={12} color="#a1a1aa" />
              <Text className="text-zinc-400 text-xs">
                {event.attendancesCount} participantes
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}
