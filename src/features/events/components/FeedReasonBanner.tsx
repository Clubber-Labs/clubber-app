import { useId } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import type { ComponentProps } from 'react'
import type { FeedReason } from '@/shared/types'
import { colors } from '@/shared/theme'

type IconName = ComponentProps<typeof Ionicons>['name']

type Props = {
  reason: FeedReason
}

export function FeedReasonBanner({ reason }: Props) {
  const content = render(reason)
  // useId é estável por instância e evita colisão de id de gradiente entre os
  // vários banners da lista (os dois-pontos do useId não valem em url(#id)).
  const gradientId = `reason-${useId().replace(/:/g, '')}`
  // Kind desconhecido (ex.: variante futura do backend) → sem banner, sem crash.
  if (!content) return null
  return (
    <View className="relative border-b border-line">
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop
              offset="0"
              stopColor={colors.brandSurface}
              stopOpacity={0.7}
            />
            <Stop offset="1" stopColor={colors.brandSurface} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
        />
      </Svg>
      <View className="flex-row items-center gap-1.5 px-4 py-2">
        <Ionicons name={content.icon} size={13} color={colors.brandText} />
        <Text className="flex-1 text-xs text-content-muted" numberOfLines={1}>
          {content.text}
        </Text>
      </View>
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
