import { View, Text, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { FeedEvent } from '@/shared/types'
import { EventInfoBlock } from './EventInfoBlock'

type Props = {
  events: FeedEvent[]
  onClose: () => void
  onSelect: (event: FeedEvent) => void
}

export function EventClusterList({ events, onClose, onSelect }: Props) {
  return (
    <View className="absolute bottom-4 left-4 right-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-800">
        <Text className="text-sm font-semibold text-white">
          {events.length} eventos neste local
        </Text>
        <Pressable
          onPress={onClose}
          className="w-7 h-7 items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#a1a1aa" />
        </Pressable>
      </View>
      <ScrollView style={{ maxHeight: 320 }}>
        {events.map((event, idx) => (
          <View
            key={event.id}
            className={`p-4 gap-3 ${idx > 0 ? 'border-t border-zinc-800' : ''}`}
          >
            <EventInfoBlock event={event} />
            <Pressable
              onPress={() => onSelect(event)}
              className="bg-violet-600 rounded-xl py-3 items-center"
            >
              <Text className="text-sm font-semibold text-white">
                Ver detalhes
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
