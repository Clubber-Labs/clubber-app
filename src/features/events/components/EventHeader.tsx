import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatEventDate } from '@/shared/utils/dateFormat'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import { EventStatusBadge } from './EventStatusBadge'
import { EventImagesCarousel } from './EventImagesCarousel'
import { AddressLink } from '@/shared/components/AddressLink'
import type { EventDetail } from '@/shared/types'

type Props = {
  event: EventDetail
}

export function EventHeader({ event }: Props) {
  return (
    <View>
      {/* Full-bleed: a capa usa SCREEN_WIDTH, então -mx-4 cancela o padding
          horizontal (16px) do container pai (EventPostsFeed) pra encostar nas
          bordas. O texto abaixo segue recuado pelo padding do container. */}
      <View className="-mx-4">
        <EventImagesCarousel images={event.images} />
      </View>

      <View className="pt-4 gap-3">
        <View className="flex-row items-center gap-2 flex-wrap">
          <EventStatusBadge status={event.status} date={event.date} />
          <CategoryBadge value={event.category} />
          {!event.isPublic && (
            <View className="bg-zinc-800 px-2 py-1 rounded-full">
              <Text className="text-zinc-300 text-xs font-semibold">
                Privado
              </Text>
            </View>
          )}
        </View>

        <Text className="text-2xl font-bold text-white">{event.title}</Text>

        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={16} color="#a1a1aa" />
          <Text className="text-zinc-300 text-sm">
            {formatEventDate(event.date)}
          </Text>
        </View>

        {event.address && (
          <AddressLink
            address={event.address}
            latitude={event.latitude}
            longitude={event.longitude}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="location-outline" size={16} color="#a1a1aa" />
            <Text className="text-zinc-300 text-sm flex-1">
              {event.address}
            </Text>
          </AddressLink>
        )}

        <View className="flex-row items-center gap-2">
          <Ionicons name="person-outline" size={16} color="#a1a1aa" />
          <Text className="text-zinc-300 text-sm">
            por {event.author.name} {event.author.lastname}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="people-outline" size={16} color="#a1a1aa" />
          <Text className="text-zinc-300 text-sm">
            {event._count.attendances} presença
            {event._count.attendances !== 1 && 's'}
          </Text>
        </View>
      </View>
    </View>
  )
}
