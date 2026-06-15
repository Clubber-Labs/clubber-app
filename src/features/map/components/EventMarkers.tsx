import { View, Pressable, Text, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Mapbox from '@rnmapbox/maps'
import type { FeedEvent, FriendAttendance } from '@/shared/types'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { featuredAttendees } from '@/shared/utils/featuredAttendees'
import {
  groupCoincidentEvents,
  fanoutOffset,
  fanoutRadius,
  friendStackLayout,
} from '../utils/markerLayout'
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

const PIN_SIZE = 54
const PIN_SIZE_SELECTED = 66
const FANOUT_GAP = 10
const MAX_FRIENDS = 3
const DIMMED_OPACITY = 0.5

// Pin do evento: capa do banner (images[0]). Sem capa, cai no ícone de
// calendário — mesma convenção de "evento sem imagem" do EventCard.
function EventPin({
  event,
  size,
  selected,
}: {
  event: FeedEvent
  size: number
  selected: boolean
}) {
  const cover = event.images[0]?.url
  const inner = size - 6
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: selected ? colors.content : colors.content,
        backgroundColor: colors.content,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        // Encerrados ficam esmaecidos (status vem do backend).
        opacity: event.status === 'PAST' ? 0.55 : 1,
      }}
    >
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          className="bg-surface-elevated items-center justify-center"
        >
          <Ionicons
            name="calendar-outline"
            size={Math.round(inner * 0.45)}
            color={colors.contentFaint}
          />
        </View>
      )}
    </View>
  )
}

type StackItem = { key: string; index: number } & (
  | { kind: 'avatar'; attendee: FriendAttendance }
  | { kind: 'more'; count: number }
)

// Prova social pendurada na base do pin (só pin único):
//  - evento COM capa → avatar do organizador (sempre, mesmo com o card aberto)
//  - evento SEM capa → pilha de participantes (amigos primeiro) + "+N", só no
//    modo de navegação (some ao abrir o card de detalhes)
function socialItems(event: FeedEvent, detailsOpen: boolean): StackItem[] {
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
  const size = selected ? PIN_SIZE_SELECTED : PIN_SIZE
  const opacity = dimmed ? DIMMED_OPACITY : 1
  const items = socialItems(event, !!detailsOpen)

  const pin = (
    <Pressable
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={`Ver evento ${event.title}`}
      hitSlop={6}
    >
      <EventPin event={event} size={size} selected={selected} />
    </Pressable>
  )

  if (items.length === 0) {
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
            left: layout.centerX + item.index * layout.step - f / 2,
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
        style={{
          width: frame,
          height: frame,
          opacity: dimmed ? DIMMED_OPACITY : 1,
        }}
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
              <EventPin event={event} size={size} selected={selected} />
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
