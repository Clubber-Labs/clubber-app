import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg'
import { EventDateChip } from '@/features/events/components/EventDateChip'
import type { UserEventSummary } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: UserEventSummary
  onPress: () => void
}

// Tile da vitrine de eventos do perfil. Mesma linguagem do EventCard: bloco-data
// no topo, scrim no rodapé pro título, gradiente da marca quando não há foto.
export function ProfileEventTile({ event, onPress }: Props) {
  const imageUrl = event.images[0]?.url ?? null
  const bgId = `ptile-bg-${event.id}`
  const scrimId = `ptile-scrim-${event.id}`

  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-1 overflow-hidden rounded-xl bg-surface"
      style={{ aspectRatio: 3 / 4 }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id={bgId} cx="0" cy="0" r="1.1">
              <Stop offset="0" stopColor={colors.brandSurfaceStrong} />
              <Stop offset="0.7" stopColor={colors.surface} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${bgId})`} />
        </Svg>
      )}

      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.4" stopColor={colors.background} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.background} stopOpacity={0.85} />
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

      <View className="absolute left-2 top-2">
        <EventDateChip date={event.date} compact />
      </View>
      {!event.isPublic && (
        <View className="absolute right-2 top-2 rounded-md border border-white/15 bg-black/70 p-1">
          <Ionicons
            name="lock-closed"
            size={11}
            color={colors.contentTertiary}
          />
        </View>
      )}

      <View className="absolute inset-x-2.5 bottom-2.5">
        <Text
          className="text-sm font-extrabold leading-tight text-content"
          numberOfLines={2}
        >
          {event.title}
        </Text>
        {typeof event.attendancesCount === 'number' && (
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="people" size={11} color={colors.contentTertiary} />
            <Text className="text-[11px] font-semibold text-content-tertiary">
              {event.attendancesCount}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}
