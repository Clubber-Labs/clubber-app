import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'
import type { FeedEvent } from '@/shared/types'
import { EventDateChip } from '@/features/events/components/EventDateChip'
import { EventStatusBadge } from '@/features/events/components/EventStatusBadge'
import { EventAttendeesStack } from '@/features/events/components/EventAttendeesStack'
import { distanceKm, formatDistance } from '@/shared/utils/distance'
import { featuredAttendees } from '@/shared/utils/featuredAttendees'
import { colors } from '@/shared/theme'

type Props = {
  event: FeedEvent
  // Coords do usuário [lng, lat] pra calcular a distância; null se indisponível.
  userCoords: [number, number] | null
  onClose: () => void
  onSeeDetails: () => void
}

// Card de preview ao tocar num pin: mini-hero coerente com o feed/detalhe —
// capa (ou gradiente da marca) + bloco-data + status + título + local · distância
// + prova social, com CTA pro detalhe.
export function EventPreviewCard({
  event,
  userCoords,
  onClose,
  onSeeDetails,
}: Props) {
  const cover = event.images[0]?.url
  const gradId = `preview-grad-${event.id}`
  const attendees = featuredAttendees(event)
  const distance = userCoords
    ? formatDistance(distanceKm(userCoords, [event.longitude, event.latitude]))
    : null
  const locationText = [event.address, distance].filter(Boolean).join(' · ')

  return (
    <View className="absolute bottom-4 left-3 right-3 rounded-xl border border-line-strong bg-surface p-3">
      <Pressable
        onPress={onClose}
        accessibilityLabel="Fechar"
        hitSlop={8}
        className="absolute right-2.5 top-2.5 z-10 h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated"
      >
        <Ionicons name="close" size={16} color={colors.contentMuted} />
      </Pressable>

      <View className="flex-row gap-3">
        <View className="h-20 w-20 overflow-hidden rounded-lg bg-surface-elevated">
          {cover ? (
            <Image
              source={{ uri: cover }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id={gradId} cx="0" cy="0" r="1">
                  <Stop offset="0" stopColor={colors.brandSurfaceStrong} />
                  <Stop offset="0.7" stopColor={colors.surface} />
                </RadialGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`url(#${gradId})`}
              />
            </Svg>
          )}
          <View className="absolute bottom-1 left-1">
            <EventDateChip date={event.date} compact />
          </View>
        </View>

        <View className="flex-1 gap-1.5 pr-6">
          <View className="flex-row">
            <EventStatusBadge status={event.status} date={event.date} />
          </View>
          <Text
            className="text-base font-extrabold text-content"
            numberOfLines={2}
          >
            {event.title}
          </Text>
          {!!locationText && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="location-outline"
                size={13}
                color={colors.contentSubtle}
              />
              <Text
                className="flex-1 text-xs text-content-muted"
                numberOfLines={1}
              >
                {locationText}
              </Text>
            </View>
          )}
          {attendees.length > 0 && (
            <EventAttendeesStack
              attendees={attendees}
              totalAttendances={event._count.attendances}
            />
          )}
        </View>
      </View>

      <Pressable
        onPress={onSeeDetails}
        className="mt-3 h-11 flex-row items-center justify-center gap-1.5 rounded-lg bg-brand"
      >
        <Text className="text-sm font-bold text-content">Ver detalhes</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.content} />
      </Pressable>
    </View>
  )
}
