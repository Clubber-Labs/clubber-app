import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatEventDate } from '@/shared/utils/dateFormat'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import { AddressLink } from '@/shared/components/AddressLink'
import { EventStatusBadge } from '@/features/events/components/EventStatusBadge'
import type { FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: FeedEvent
}

export function EventInfoBlock({ event }: Props) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-1.5 flex-wrap">
        <EventStatusBadge status={event.status} date={event.date} />
        {event.categories.map(category => (
          <CategoryBadge key={category} value={category} />
        ))}
        {!event.isPublic && (
          <View className="bg-surface-elevated px-2 py-0.5 rounded-full">
            <Text className="text-content-tertiary text-[11px] font-semibold">
              Privado
            </Text>
          </View>
        )}
      </View>

      <Text className="text-base font-bold text-content" numberOfLines={2}>
        {event.title}
      </Text>

      <View className="gap-1">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.contentMuted}
          />
          <Text
            className="text-xs text-content-tertiary flex-1"
            numberOfLines={1}
          >
            {formatEventDate(event.date)}
          </Text>
        </View>

        {event.address && (
          <AddressLink
            address={event.address}
            latitude={event.latitude}
            longitude={event.longitude}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.contentMuted}
            />
            <Text
              className="text-xs text-content-tertiary flex-1"
              numberOfLines={1}
            >
              {event.address}
            </Text>
          </AddressLink>
        )}

        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="person-outline"
            size={14}
            color={colors.contentMuted}
          />
          <Text className="text-xs text-content-muted flex-1" numberOfLines={1}>
            por {event.author.name} {event.author.lastname}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="people-outline"
            size={14}
            color={colors.contentMuted}
          />
          <Text className="text-xs text-content-muted">
            {event._count.attendances} indo
          </Text>
        </View>
      </View>
    </View>
  )
}
