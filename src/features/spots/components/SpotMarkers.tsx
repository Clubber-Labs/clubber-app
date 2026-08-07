import { View, Text, Pressable } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import Svg, { Path } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  spots: Spot[]
  selectedId?: string
  onPress: (spot: Spot) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

const BALLOON_SIZE = 48
const BALLOON_SIZE_SELECTED = 58
const DIMMED_OPACITY = 0.5
const VIOLET = colors.brandEmphasis

// Balão de mensagem (estilo 💬) num contorno ÚNICO: caixa arredondada e
// rabinho no mesmo path, sem emenda. Desenhado num canvas 64×72 com a caixa
// de 48 ocupando x 6..54, y 10..58; tudo escala por size/48.
const CANVAS_W = 64
const CANVAS_H = 72
const BALLOON_PATH = [
  'M 22 11.5 H 38 Q 52.5 11.5 52.5 26 V 42',
  'Q 52.5 56.5 38 56.5 H 27.5',
  'L 12.8 68.6 Q 9.6 71 11.2 67.3 L 15.5 56.5',
  'Q 7.5 56.5 7.5 42 V 26 Q 7.5 11.5 22 11.5 Z',
].join(' ')
// Ponta do rabinho no canvas — é ela que aponta o lugar do rolê.
const TAIL_TIP_ANCHOR = { x: 10.8 / CANVAS_W, y: 69.2 / CANVAS_H }
const AVATAR_SIZE = 34
const AVATAR_LEFT = 13
const AVATAR_TOP = 17
const BADGE_CENTER_X = 54
const BADGE_CENTER_Y = 10

// Balão com a foto de perfil do criador dentro + badge de membros. O formato
// de "speech bubble" diferencia dos pins de evento (gota com capa do banner).
function SpotBalloon({ spot, size }: { spot: Spot; size: number }) {
  const u = size / BALLOON_SIZE
  return (
    <View style={{ width: CANVAS_W * u, height: CANVAS_H * u }}>
      <Svg
        width={CANVAS_W * u}
        height={CANVAS_H * u}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      >
        <Path
          d={BALLOON_PATH}
          fill={colors.surfaceSunken}
          stroke={VIOLET}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: AVATAR_LEFT * u,
          top: AVATAR_TOP * u,
        }}
      >
        <UserAvatar
          name={`${spot.creator.name} ${spot.creator.lastname}`}
          avatarUrl={spot.creator.avatarUrl}
          size={AVATAR_SIZE * u}
        />
      </View>
      {spot.memberCount > 1 && (
        <View
          style={{
            position: 'absolute',
            left: BADGE_CENTER_X * u - 10,
            top: BADGE_CENTER_Y * u - 10,
          }}
          className="bg-brand rounded-full min-w-[20px] h-5 px-1 items-center justify-center border border-background"
        >
          <Text className="text-content text-[10px] font-bold">
            {spot.memberCount}
          </Text>
        </View>
      )}
    </View>
  )
}

export function SpotMarkers({ spots, selectedId, onPress, dimmed }: Props) {
  return (
    <>
      {spots.map(spot => {
        const selected = selectedId === spot.id
        const size = selected ? BALLOON_SIZE_SELECTED : BALLOON_SIZE
        return (
          <Mapbox.MarkerView
            key={spot.id}
            id={`spot-${spot.id}`}
            coordinate={[spot.longitude, spot.latitude]}
            anchor={TAIL_TIP_ANCHOR}
            allowOverlap
          >
            <View style={{ opacity: dimmed ? DIMMED_OPACITY : 1 }}>
              <Pressable
                onPress={() => onPress(spot)}
                accessibilityRole="button"
                accessibilityLabel={`Ver spot ${spot.title}`}
                hitSlop={6}
              >
                <SpotBalloon spot={spot} size={size} />
              </Pressable>
            </View>
          </Mapbox.MarkerView>
        )
      })}
    </>
  )
}
