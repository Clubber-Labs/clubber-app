import { View, Pressable, Text } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import type { FeedEvent, FriendAttendance } from '@/shared/types'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { featuredAttendees } from '@/shared/utils/featuredAttendees'
import {
  groupCoincidentEvents,
  fanoutOffset,
  fanoutRadius,
  friendStackLayout,
  pinTailHeight,
} from '../utils/markerLayout'
import { eventPinLook } from '../utils/eventPinLook'
import {
  EventPin,
  EVENT_PIN_SIZE,
  EVENT_PIN_SIZE_SELECTED,
  EVENT_PIN_TIP_ANCHOR,
} from './EventPin'
import { colors } from '@/shared/theme'

type Props = {
  events: FeedEvent[]
  selectedId?: string
  onPress: (event: FeedEvent) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
  // Com um card de detalhes aberto, a pilha de participantes some dos pins; o
  // avatar do organizador (eventos com capa) permanece.
  detailsOpen?: boolean
}

const FANOUT_GAP = 10
const MAX_FRIENDS = 2
const DIMMED_OPACITY = 0.5

type StackItem = { key: string; index: number } & (
  | { kind: 'avatar'; attendee: FriendAttendance }
  | { kind: 'more'; count: number }
)

function attendeeItems(event: FeedEvent): StackItem[] {
  const attendees = featuredAttendees(event).slice(0, MAX_FRIENDS)
  const moreCount = Math.max(0, event._count.attendances - attendees.length)
  const items: StackItem[] = attendees.map((attendee, index) => ({
    key: attendee.user.id,
    index,
    kind: 'avatar',
    attendee,
  }))
  if (attendees.length > 0 && moreCount > 0) {
    items.push({
      key: 'more',
      index: attendees.length,
      kind: 'more',
      count: moreCount,
    })
  }
  return items
}

// Prova social pendurada na base do pin (só pin único):
//  - PATROCINADO → pilha de participantes mesmo com capa (a tração real vende
//    mais que o avatar do organizador); sem confirmados, cai na regra da capa
//  - evento COM capa → avatar do organizador (sempre, mesmo com o card aberto)
//  - evento SEM capa → pilha de participantes (amigos primeiro) + "+N", só no
//    modo de navegação (some ao abrir o card de detalhes)
function socialItems(event: FeedEvent, detailsOpen: boolean): StackItem[] {
  if (event.isFeatured && !detailsOpen) {
    const items = attendeeItems(event)
    if (items.length > 0) return items
  }

  if (event.images[0]?.url) {
    return [
      {
        key: event.author.id,
        index: 0,
        kind: 'avatar',
        attendee: { user: event.author },
      },
    ]
  }

  if (detailsOpen) return []

  return attendeeItems(event)
}

function SingleMarker({
  event,
  selected,
  onPress,
  dimmed,
  detailsOpen,
}: {
  event: FeedEvent
  selected: boolean
  onPress: (event: FeedEvent) => void
  dimmed?: boolean
  detailsOpen?: boolean
}) {
  const size = selected ? EVENT_PIN_SIZE_SELECTED : EVENT_PIN_SIZE
  const opacity = dimmed ? DIMMED_OPACITY : 1
  const items = socialItems(event, !!detailsOpen)

  const pin = (
    <Pressable
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={`Ver evento ${event.title}`}
      hitSlop={6}
    >
      <EventPin {...eventPinLook(event)} size={size} selected={selected} />
    </Pressable>
  )

  if (items.length === 0) {
    return (
      <Mapbox.MarkerView
        id={`event-${event.id}`}
        coordinate={[event.longitude, event.latitude]}
        anchor={EVENT_PIN_TIP_ANCHOR}
        allowOverlap
      >
        <View style={{ opacity }}>{pin}</View>
      </Mapbox.MarkerView>
    )
  }

  const layout = friendStackLayout(size, pinTailHeight(size), items.length)
  const f = layout.avatarSize

  return (
    <Mapbox.MarkerView
      id={`event-${event.id}`}
      coordinate={[event.longitude, event.latitude]}
      anchor={layout.anchor}
      allowOverlap
    >
      <View
        style={{
          width: layout.frameWidth,
          height: layout.frameHeight,
          opacity,
        }}
        pointerEvents="box-none"
      >
        <View style={{ position: 'absolute', left: 0, top: 0 }}>{pin}</View>

        {[...items].reverse().map(item => {
          const base = {
            position: 'absolute' as const,
            left: layout.firstAvatarX + item.index * layout.step - f / 2,
            top: layout.friendTop,
            width: f,
            height: f,
            borderRadius: f / 2,
            borderWidth: 2,
            borderColor: colors.surfaceSunken,
            overflow: 'hidden' as const,
          }
          if (item.kind === 'more') {
            return (
              <View
                key={item.key}
                pointerEvents="none"
                style={{
                  ...base,
                  backgroundColor: colors.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.content,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
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
  const radius = fanoutRadius(group.length, EVENT_PIN_SIZE_SELECTED, FANOUT_GAP)
  const frame = EVENT_PIN_SIZE_SELECTED + radius * 2
  // O quadro cresce pra baixo pra caber o rabinho das gotas; a âncora mantém
  // o centro do leque sobre a coordenada compartilhada.
  const frameHeight = frame + pinTailHeight(EVENT_PIN_SIZE_SELECTED)

  return (
    <Mapbox.MarkerView
      id={`event-group-${anchor.id}`}
      coordinate={[anchor.longitude, anchor.latitude]}
      anchor={{ x: 0.5, y: frame / 2 / frameHeight }}
      allowOverlap
    >
      <View
        style={{
          width: frame,
          height: frameHeight,
          opacity: dimmed ? DIMMED_OPACITY : 1,
        }}
        pointerEvents="box-none"
      >
        {group.map((event, index) => {
          const selected = selectedId === event.id
          const size = selected ? EVENT_PIN_SIZE_SELECTED : EVENT_PIN_SIZE
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
              <EventPin
                {...eventPinLook(event)}
                size={size}
                selected={selected}
              />
            </Pressable>
          )
        })}
      </View>
    </Mapbox.MarkerView>
  )
}

export function EventMarkers({
  events,
  selectedId,
  onPress,
  dimmed,
  detailsOpen,
}: Props) {
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
            detailsOpen={detailsOpen}
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
