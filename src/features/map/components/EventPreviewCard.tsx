import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { FeedEvent } from '@/shared/types'
import { EventInfoBlock } from './EventInfoBlock'
import { colors } from '@/shared/theme'

type Props = {
  event: FeedEvent
  onClose: () => void
  onSeeDetails: () => void
}

export function EventPreviewCard({ event, onClose, onSeeDetails }: Props) {
  return (
    <View className="absolute bottom-4 left-4 right-4 bg-surface border border-line rounded-2xl p-4 gap-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <EventInfoBlock event={event} />
        </View>
        <Pressable
          onPress={onClose}
          className="w-7 h-7 items-center justify-center"
        >
          <Ionicons name="close" size={20} color={colors.contentMuted} />
        </Pressable>
      </View>

      <Pressable
        onPress={onSeeDetails}
        className="bg-brand rounded-xl py-3 items-center"
      >
        <Text className="text-sm font-semibold text-content">Ver detalhes</Text>
      </Pressable>
    </View>
  )
}
