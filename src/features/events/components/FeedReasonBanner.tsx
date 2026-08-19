import { useId } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  PencilSimpleIcon,
  ArrowsClockwiseIcon,
  SparkleIcon,
  StarIcon,
  HeartIcon,
  ChatCircleIcon,
  CompassIcon,
} from 'phosphor-react-native'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import type { Icon } from 'phosphor-react-native'
import type { FeedReason } from '@/shared/types'
import { colors, categoryHue } from '@/shared/theme'

type Props = {
  reason: FeedReason
  // Matiz da categoria do evento — tinge SÓ razões sociais (amigo fez algo);
  // razões de sistema (você criou/interagiu, descoberta) seguem neutras.
  categories?: string[]
}

const SOCIAL_KINDS = new Set([
  'friend_created',
  'friend_attending',
  'friend_reacted',
  'friend_commented',
])

export function FeedReasonBanner({ reason, categories }: Props) {
  const { t } = useTranslation()
  const content = render(reason)
  // useId é estável por instância e evita colisão de id de gradiente entre os
  // vários banners da lista (os dois-pontos do useId não valem em url(#id)).
  const gradientId = `reason-${useId().replace(/:/g, '')}`
  // Kind desconhecido (ex.: variante futura do backend) → sem banner, sem crash.
  if (!content) return null
  const social = SOCIAL_KINDS.has(reason.kind)
  const hue = social ? categoryHue(categories?.[0]) : null
  const tint = hue ? hue.chipBg : colors.brandSurface
  return (
    <View className="relative border-b border-line">
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={tint} stopOpacity={0.7} />
            <Stop offset="1" stopColor={tint} stopOpacity={0} />
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
        <content.icon
          size={13}
          weight="fill"
          color={hue ? hue.chipText : colors.brandText}
        />
        <Text className="flex-1 text-xs text-content-muted" numberOfLines={1}>
          {t(content.key, content.params)}
        </Text>
      </View>
    </View>
  )
}

// Decide a CHAVE do banner (função pura de módulo); a tradução acontece no
// render do componente, com o t() assinado pra re-renderizar na troca de idioma.
type ReasonContent = {
  icon: Icon
  key:
    | `events.reason.${'selfCreated' | 'selfInteraction' | 'discovery'}`
    | `events.reason.${'friendCreated' | 'friendGoing' | 'friendInterested' | 'friendLiked'}`
    | 'events.reason.friendCommented'
  params?: { name: string; preview?: string }
}

function render(reason: FeedReason): ReasonContent | null {
  switch (reason.kind) {
    case 'self_created':
      return { icon: PencilSimpleIcon, key: 'events.reason.selfCreated' }
    case 'self_interaction':
      return { icon: ArrowsClockwiseIcon, key: 'events.reason.selfInteraction' }
    case 'friend_created':
      return {
        icon: SparkleIcon,
        key: 'events.reason.friendCreated',
        params: { name: reason.user.name },
      }
    case 'friend_attending':
      return {
        icon: StarIcon,
        key:
          reason.type === 'CONFIRMED'
            ? 'events.reason.friendGoing'
            : 'events.reason.friendInterested',
        params: { name: reason.user.name },
      }
    case 'friend_reacted':
      return {
        icon: HeartIcon,
        key: 'events.reason.friendLiked',
        params: { name: reason.user.name },
      }
    case 'friend_commented':
      return {
        icon: ChatCircleIcon,
        key: 'events.reason.friendCommented',
        params: { name: reason.user.name, preview: reason.preview },
      }
    case 'discovery':
      return { icon: CompassIcon, key: 'events.reason.discovery' }
    default:
      return null
  }
}
