import { View, Pressable } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import type { FeedEvent } from '@/shared/types'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { VIOLET_400, VIOLET_600 } from '../constants'
import {
  groupCoincidentEvents,
  fanoutOffset,
  fanoutRadius,
} from '../utils/markerLayout'

type Props = {
  events: FeedEvent[]
  selectedId?: string
  onPress: (event: FeedEvent) => void
}

const PIN_SIZE = 40
const PIN_SIZE_SELECTED = 52
const FANOUT_GAP = 10

export function EventMarkers({ events, selectedId, onPress }: Props) {
  const groups = groupCoincidentEvents(events)

  return (
    <>
      {groups.map(group => {
        const anchor = group[0]
        // raio dinâmico cresce com o tamanho do grupo pra evitar sobreposição
        const radius = fanoutRadius(
          group.length,
          PIN_SIZE_SELECTED,
          FANOUT_GAP,
        )
        const frame = PIN_SIZE_SELECTED + radius * 2

        return (
          <Mapbox.MarkerView
            key={anchor.id}
            id={`event-group-${anchor.id}`}
            coordinate={[anchor.longitude, anchor.latitude]}
            anchor={{ x: 0.5, y: 0.5 }}
            allowOverlap
          >
            <View
              style={{ width: frame, height: frame }}
              pointerEvents="box-none"
            >
              {group.map((event, index) => {
                const isSelected = selectedId === event.id
                const size = isSelected ? PIN_SIZE_SELECTED : PIN_SIZE
                const fullName =
                  `${event.author.name} ${event.author.lastname}`.trim()
                const offset = fanoutOffset(index, group.length, radius)
                const left = frame / 2 - size / 2 + offset.x
                const top = frame / 2 - size / 2 + offset.y

                return (
                  <Pressable
                    key={event.id}
                    onPress={() => onPress(event)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver evento ${event.title}`}
                    hitSlop={6}
                    style={{ position: 'absolute', left, top }}
                  >
                    <View
                      style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: 3,
                        borderColor: isSelected ? VIOLET_400 : VIOLET_600,
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                      }}
                    >
                      <UserAvatar
                        name={fullName}
                        avatarUrl={event.author.avatarUrl}
                        size={size - 6}
                      />
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </Mapbox.MarkerView>
        )
      })}
    </>
  )
}
