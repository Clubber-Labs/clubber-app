import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import type { FeedReason } from '@/shared/types'

type IconName = ComponentProps<typeof Ionicons>['name']

type Props = {
  reason: FeedReason
}

export function FeedReasonBanner({ reason }: Props) {
  const content = render(reason)
  // Kind desconhecido (ex.: variante futura do backend) → sem banner, sem crash.
  if (!content) return null
  return (
    <View className="flex-row items-center gap-1.5 px-4 py-2 bg-zinc-950 border-b border-zinc-800">
      <Ionicons name={content.icon} size={13} color="#a78bfa" />
      <Text className="text-xs text-zinc-400 flex-1" numberOfLines={1}>
        {content.text}
      </Text>
    </View>
  )
}

function render(reason: FeedReason): { icon: IconName; text: string } | null {
  switch (reason.kind) {
    case 'self_created':
      return { icon: 'create', text: 'Você criou este evento' }
    case 'self_interaction':
      return { icon: 'sync', text: 'Você interagiu com este evento' }
    case 'friend_created':
      return {
        icon: 'sparkles',
        text: `${reason.user.name} criou um evento`,
      }
    case 'friend_attending':
      return {
        icon: 'star',
        text:
          reason.type === 'CONFIRMED'
            ? `${reason.user.name} vai a este evento`
            : `${reason.user.name} tem interesse neste evento`,
      }
    case 'friend_reacted':
      return {
        icon: 'heart',
        text: `${reason.user.name} curtiu este evento`,
      }
    case 'friend_commented':
      return {
        icon: 'chatbubble',
        text: `${reason.user.name} comentou: "${reason.preview}"`,
      }
    case 'discovery':
      return { icon: 'compass', text: 'Recomendado para você' }
    default:
      return null
  }
}
