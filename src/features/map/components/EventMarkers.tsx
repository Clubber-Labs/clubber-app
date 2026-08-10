import { View, Pressable, Text } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import Svg, { Circle, Path } from 'react-native-svg'
import type { FeedEvent, FriendAttendance } from '@/shared/types'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { EmojiPinFace } from '@/shared/components/EmojiPinFace'
import { featuredAttendees } from '@/shared/utils/featuredAttendees'
import { eventCategoryEmoji } from '@/shared/utils/eventCategoryEmoji'
import {
  groupCoincidentEvents,
  fanoutOffset,
  fanoutRadius,
  friendStackLayout,
  pinTailHeight,
  pinTailPath,
  PIN_RIM_COLOR,
  PIN_RIM_COLOR_ON_DARK,
  PIN_RIM_WIDTH,
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
const MAX_FRIENDS = 2
const DIMMED_OPACITY = 0.5

// Pin do evento em gota invertida: a cabeça mostra SEMPRE o emoji da
// categoria sobre campo grafite — a capa do banner fica pro card de preview
// e pro avatar do organizador pendurado (socialItems), nunca na cabeça.
// Patrocinado destaca por INVERSÃO (única casca escura do mapa + selo ★),
// não por cor de marca.
function EventPin({
  event,
  size,
  selected,
}: {
  event: FeedEvent
  size: number
  selected: boolean
}) {
  const inner = size - 6
  const height = size + pinTailHeight(size)
  const featured = event.isFeatured
  const shell = featured
    ? colors.background
    : selected
      ? colors.contentBright
      : colors.content
  const rim = featured ? PIN_RIM_COLOR_ON_DARK : PIN_RIM_COLOR
  const sealSize = Math.round(size * 0.34)
  return (
    <View
      style={{
        width: size,
        height,
        // Encerrados ficam esmaecidos (status vem do backend).
        opacity: event.status === 'PAST' ? 0.55 : 1,
      }}
    >
      <Svg
        width={size + 4}
        height={height + 4}
        viewBox={`-2 -2 ${size + 4} ${height + 4}`}
        style={{ position: 'absolute', left: -2, top: -2 }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 + PIN_RIM_WIDTH}
          fill={rim}
        />
        <Path d={pinTailPath(size, PIN_RIM_WIDTH)} fill={rim} />
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={shell} />
        <Path d={pinTailPath(size)} fill={shell} />
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: 3,
          top: 3,
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          overflow: 'hidden',
        }}
      >
        <EmojiPinFace
          size={inner}
          emoji={eventCategoryEmoji(event.categories)}
        />
      </View>
      {featured && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: sealSize,
            height: sealSize,
            borderRadius: sealSize / 2,
            backgroundColor: colors.content,
            borderWidth: 1,
            borderColor: PIN_RIM_COLOR,
          }}
          className="items-center justify-center"
        >
          <Text
            style={{
              color: colors.background,
              fontSize: Math.round(sealSize * 0.62),
              fontWeight: '700',
              includeFontPadding: false,
            }}
          >
            ★
          </Text>
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
        anchor={{ x: 0.5, y: 1 }}
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
  const radius = fanoutRadius(group.length, PIN_SIZE_SELECTED, FANOUT_GAP)
  const frame = PIN_SIZE_SELECTED + radius * 2
  // O quadro cresce pra baixo pra caber o rabinho das gotas; a âncora mantém
  // o centro do leque sobre a coordenada compartilhada.
  const frameHeight = frame + pinTailHeight(PIN_SIZE_SELECTED)

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
