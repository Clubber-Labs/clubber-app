import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatEventDate } from '@/shared/utils/dateFormat'
import type { FeedEvent } from '@/shared/types'

type Props = {
  event: FeedEvent
}

export function EventInfoBlock({ event }: Props) {
  return (
    <View>
      <Text className="text-base font-bold text-white" numberOfLines={1}>
        {event.title}
      </Text>
      <View className="flex-row items-center gap-1 mt-1">
        <Ionicons name="calendar-outline" size={14} color="#a1a1aa" />
        <Text className="text-xs text-zinc-400">
          {formatEventDate(event.date)}
        </Text>
      </View>
      {event.address && (
        <View className="flex-row items-center gap-1 mt-1">
          <Ionicons name="location-outline" size={14} color="#a1a1aa" />
          <Text className="text-xs text-zinc-400 flex-1" numberOfLines={1}>
            {event.address}
          </Text>
        </View>
      )}
    </View>
  )
}
