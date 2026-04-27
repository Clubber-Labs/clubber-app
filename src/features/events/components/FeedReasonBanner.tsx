import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { FeedReason } from '../utils/feedReason'

type Props = {
  reason: FeedReason
}

export function FeedReasonBanner({ reason }: Props) {
  const { icon, text } = render(reason)
  return (
    <View className="flex-row items-center gap-1.5 px-4 py-2 bg-zinc-950 border-b border-zinc-800">
      <Ionicons name={icon} size={13} color="#a78bfa" />
      <Text className="text-xs text-zinc-400 flex-1" numberOfLines={1}>
        {text}
      </Text>
    </View>
  )
}

function render(reason: FeedReason): {
  icon: 'sparkles' | 'star' | 'chatbubble' | 'create'
  text: string
} {
  switch (reason.kind) {
    case 'self_created':
      return { icon: 'create', text: 'Você criou este evento' }
    case 'friend_created':
      return { icon: 'sparkles', text: `${reason.name} criou um evento` }
    case 'friend_attending':
      if (reason.others === 0) {
        return { icon: 'star', text: `${reason.name} vai a este evento` }
      }
      return {
        icon: 'star',
        text: `${reason.name} e mais ${reason.others} ${reason.others === 1 ? 'amigo' : 'amigos'} vão`,
      }
    case 'friend_commented':
      return { icon: 'chatbubble', text: `${reason.name} comentou neste evento` }
  }
}
