import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg'
import { EventDateChip } from './EventDateChip'
import { EventStatusBadge } from './EventStatusBadge'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatFullName } from '@/shared/utils/fullName'
import type { FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: FeedEvent
  onAuthorPress?: () => void
}

// Sombra de texto pra manter o nome legível sobre fotos claras (junto do scrim).
const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.7)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
}

function PrivatePill() {
  return (
    <View className="flex-row items-center gap-1 rounded-md border border-white/15 bg-black/70 px-2 py-1">
      <Ionicons name="lock-closed" size={11} color={colors.contentTertiary} />
      <Text className="text-[11px] font-semibold text-content-tertiary">
        Privado
      </Text>
    </View>
  )
}

// Bloco-calendário à esquerda, status/privacidade à direita — mesma faixa no
// topo do herói, com ou sem imagem.
function TopChips({ event, isPast }: { event: FeedEvent; isPast: boolean }) {
  return (
    <View className="flex-row items-start justify-between">
      <EventDateChip date={event.date} muted={isPast} />
      <View className="flex-row items-center gap-1.5">
        {!event.isPublic && <PrivatePill />}
        <EventStatusBadge status={event.status} date={event.date} />
      </View>
    </View>
  )
}

export function EventCardHero({ event, onAuthorPress }: Props) {
  const imageUrl = event.images[0]?.url ?? null
  const isPast = event.status === 'PAST' || event.status === 'CANCELED'

  if (imageUrl) {
    // Com foto: ela ancora o card. Scrim escuro só no rodapé pra legibilidade
    // do autor (sobreposto como assinatura), preservando a foto no topo.
    const scrimId = `scrim-${event.id}`
    return (
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', aspectRatio: 16 / 10 }}
          className="bg-surface-elevated"
          resizeMode="cover"
        />
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0.45"
                stopColor={colors.background}
                stopOpacity={0}
              />
              <Stop
                offset="1"
                stopColor={colors.background}
                stopOpacity={0.8}
              />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#${scrimId})`}
          />
        </Svg>
        <View className="absolute inset-x-3 top-3">
          <TopChips event={event} isPast={isPast} />
        </View>
        <Pressable
          onPress={onAuthorPress}
          accessibilityLabel={`Ver perfil de ${event.author.username}`}
          className="absolute inset-x-3 bottom-3 flex-row items-center gap-2"
        >
          <View className="rounded-full border-2 border-white/80">
            <UserAvatar
              name={event.author.name}
              avatarUrl={event.author.avatarUrl}
              size={40}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-sm font-bold text-content"
              numberOfLines={1}
              style={textShadow}
            >
              {formatFullName(event.author.name, event.author.lastname)}
            </Text>
            <Text
              className="text-[11px] text-content-tertiary"
              style={textShadow}
            >
              Organizador
            </Text>
          </View>
        </Pressable>
      </View>
    )
  }

  // Sem foto: o título vira o herói sobre um brilho sutil da marca no canto,
  // esvaecendo para a superfície do card (id do gradiente por evento pra não
  // colidir entre múltiplos Svg na lista).
  const gradientId = `hero-${event.id}`
  return (
    <View className="relative overflow-hidden bg-surface">
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={gradientId} cx="0" cy="0" r="1">
            <Stop offset="0" stopColor={colors.brandSurfaceStrong} />
            <Stop offset="0.62" stopColor={colors.surface} />
          </RadialGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
        />
      </Svg>
      <View className="gap-3 px-4 pb-4 pt-3">
        <TopChips event={event} isPast={isPast} />
        <Text
          className="text-xl font-extrabold leading-tight text-content"
          numberOfLines={2}
        >
          {event.title}
        </Text>
      </View>
    </View>
  )
}
