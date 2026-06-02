import { View, Pressable, Text } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import type { FeedEvent, FriendAttendance } from '@/shared/types'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { VIOLET_400, VIOLET_600 } from '../constants'
import {
  groupCoincidentEvents,
  fanoutOffset,
  fanoutRadius,
  friendStackLayout,
} from '../utils/markerLayout'

type Props = {
  events: FeedEvent[]
  selectedId?: string
  onPress: (event: FeedEvent) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

const PIN_SIZE = 54
const PIN_SIZE_SELECTED = 66
const FANOUT_GAP = 10
const MAX_FRIENDS = 3
const DIMMED_OPACITY = 0.5

function AuthorPin({
  event,
  size,
  selected,
}: {
  event: FeedEvent
  size: number
  selected: boolean
}) {
  const fullName = `${event.author.name} ${event.author.lastname}`.trim()
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: selected ? VIOLET_400 : VIOLET_600,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        // Encerrados ficam esmaecidos (status vem do backend).
        opacity: event.status === 'PAST' ? 0.55 : 1,
      }}
    >
      <UserAvatar name={fullName} avatarUrl={event.author.avatarUrl} size={size - 6} />
    </View>
  )
}

type StackItem = { key: string; index: number } & (
  | { kind: 'avatar'; attendee: FriendAttendance }
  | { kind: 'more'; count: number }
)

// Pin único: criador no topo + pilha de participantes na base (amigos primeiro,
// depois não-amigos — a ordem vem do backend), do meio pra direita, sobrepostos.
function SingleMarker({
  event,
  selected,
  onPress,
  dimmed,
}: {
  event: FeedEvent
  selected: boolean
  onPress: (event: FeedEvent) => void
  dimmed?: boolean
}) {
  const size = selected ? PIN_SIZE_SELECTED : PIN_SIZE
  const opacity = dimmed ? DIMMED_OPACITY : 1
  const attendees = (event.topAttendances ?? event.friendAttendances ?? []).slice(
    0,
    MAX_FRIENDS,
  )
  const moreCount = Math.max(0, event._count.attendances - attendees.length)
  const hasMore = attendees.length > 0 && moreCount > 0

  const pin = (
    <Pressable
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={`Ver evento ${event.title}`}
      hitSlop={6}
    >
      <AuthorPin event={event} size={size} selected={selected} />
    </Pressable>
  )

  if (attendees.length === 0) {
    return (
      <Mapbox.MarkerView
        id={`event-${event.id}`}
        coordinate={[event.longitude, event.latitude]}
        anchor={{ x: 0.5, y: 0.5 }}
        allowOverlap
      >
        <View style={{ opacity }}>{pin}</View>
      </Mapbox.MarkerView>
    )
  }

  const items: StackItem[] = attendees.map((attendee, index) => ({
    key: attendee.user.id,
    index,
    kind: 'avatar',
    attendee,
  }))
  if (hasMore) {
    items.push({
      key: 'more',
      index: attendees.length,
      kind: 'more',
      count: moreCount,
    })
  }

  const layout = friendStackLayout(size, items.length)
  const f = layout.avatarSize

  return (
    <Mapbox.MarkerView
      id={`event-${event.id}`}
      coordinate={[event.longitude, event.latitude]}
      anchor={layout.anchor}
      allowOverlap
    >
      <View
        style={{ width: layout.frameWidth, height: layout.frameHeight, opacity }}
        pointerEvents="box-none"
      >
        {/* Criador atrás; os avatares ficam por cima do pin (z-order na frente). */}
        <View style={{ position: 'absolute', left: 0, top: 0 }}>{pin}</View>

        {/* Render reverso pra o avatar mais à esquerda ficar por cima (face-pile).
            pointerEvents none: os avatares não capturam toque — o pin segue clicável. */}
        {[...items].reverse().map(item => {
          const base = {
            position: 'absolute' as const,
            left: layout.centerX + item.index * layout.step - f / 2,
            top: layout.friendTop,
            width: f,
            height: f,
            borderRadius: f / 2,
            borderWidth: 2,
            borderColor: '#0a0a0a',
            overflow: 'hidden' as const,
          }
          if (item.kind === 'more') {
            return (
              <View
                key={item.key}
                pointerEvents="none"
                style={{
                  ...base,
                  backgroundColor: '#27272a',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>
                  +{item.count}
                </Text>
              </View>
            )
          }
          return (
            <View key={item.key} pointerEvents="none" style={base}>
              <UserAvatar
                name={`${item.attendee.user.name} ${item.attendee.user.lastname}`}
                avatarUrl={item.attendee.user.avatarUrl}
                size={f - 4}
              />
            </View>
          )
        })}
      </View>
    </Mapbox.MarkerView>
  )
}

// Eventos coincidentes (mesmo ponto) — leque de pins, sem amigos pra não virar
// nuvem de bolinhas; o leque já comunica que há vários aqui.
function CoincidentMarker({
  group,
  selectedId,
  onPress,
  dimmed,
}: {
  group: FeedEvent[]
  selectedId?: string
  onPress: (event: FeedEvent) => void
  dimmed?: boolean
}) {
  const anchor = group[0]
  const radius = fanoutRadius(group.length, PIN_SIZE_SELECTED, FANOUT_GAP)
  const frame = PIN_SIZE_SELECTED + radius * 2

  return (
    <Mapbox.MarkerView
      id={`event-group-${anchor.id}`}
      coordinate={[anchor.longitude, anchor.latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
      allowOverlap
    >
      <View
        style={{ width: frame, height: frame, opacity: dimmed ? DIMMED_OPACITY : 1 }}
        pointerEvents="box-none"
      >
        {group.map((event, index) => {
          const selected = selectedId === event.id
          const size = selected ? PIN_SIZE_SELECTED : PIN_SIZE
          const offset = fanoutOffset(index, group.length, radius)
          return (
            <Pressable
              key={event.id}
              onPress={() => onPress(event)}
              accessibilityRole="button"
              accessibilityLabel={`Ver evento ${event.title}`}
              hitSlop={6}
              style={{
                position: 'absolute',
                left: frame / 2 - size / 2 + offset.x,
                top: frame / 2 - size / 2 + offset.y,
              }}
            >
              <AuthorPin event={event} size={size} selected={selected} />
            </Pressable>
          )
        })}
      </View>
    </Mapbox.MarkerView>
  )
}

export function EventMarkers({ events, selectedId, onPress, dimmed }: Props) {
  const groups = groupCoincidentEvents(events)

  return (
    <>
      {groups.map(group =>
        group.length === 1 ? (
          <SingleMarker
            key={group[0].id}
            event={group[0]}
            selected={selectedId === group[0].id}
            onPress={onPress}
            dimmed={dimmed}
          />
        ) : (
          <CoincidentMarker
            key={`group-${group[0].id}`}
            group={group}
            selectedId={selectedId}
            onPress={onPress}
            dimmed={dimmed}
          />
        ),
      )}
    </>
  )
}
