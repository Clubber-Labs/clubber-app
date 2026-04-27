import { View, Text } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import type { FeedEvent } from '@/shared/types'
import { VIOLET_400, VIOLET_600 } from '../constants'

type Props = {
  events: FeedEvent[]
  selectedId?: string
  onPress: (event: FeedEvent) => void
}

export function EventMarkers({ events, selectedId, onPress }: Props) {
  return (
    <>
      {events.map(event => {
        const isSelected = selectedId === event.id
        return (
          <Mapbox.MarkerView
            key={event.id}
            id={`event-${event.id}`}
            coordinate={[event.longitude, event.latitude]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              onTouchEnd={() => onPress(event)}
              style={{
                backgroundColor: isSelected ? VIOLET_400 : VIOLET_600,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: '#ffffff',
                maxWidth: 180,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}
                numberOfLines={1}
              >
                📅 {event.title}
              </Text>
            </View>
          </Mapbox.MarkerView>
        )
      })}
    </>
  )
}
